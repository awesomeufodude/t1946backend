import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Permission } from 'src/infrastructure/database/entities/permission.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { EmailService } from 'src/infrastructure/email/email.service';
import { UserDto } from 'src/modules/admin/users/users.dto';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import HashingUtils from 'src/shared/utils/hashing.utils';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LoginRequestDto } from './authentication.dto';
import { PasscodeCredentialService } from './passcode-credential.service';
import { SessionCodeRequestDto } from './session-code-dto';
@Injectable()
export class AuthenticationService {
  private readonly EMAIL_CONCAT = '@borealis.cl';
  private readonly OPERATION_ASK = 'ask';
  private readonly OPERATION_VERIFY = 'verify';
  private readonly SUBJECT = 'Envio de código de verificación';
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    private readonly passcodeCredentialService: PasscodeCredentialService,
    private readonly emailService: EmailService,
  ) {}

  public async login(loginRequest: LoginRequestDto): Promise<AppDomain.Session> {
    this.logger.log(`login: ${JSON.stringify(loginRequest, null, 2)}`);
    const user: User = await this.userRepository.findByEmail(loginRequest.email);
    if (!user) {
      return null;
    }
    this.logger.log(JSON.stringify(user));
    const matched = await HashingUtils.secureCompare(loginRequest.password, user.passwordHash);
    if (!matched) {
      return null;
    }
    const session = await this.createSession(user, AppDomain.Scopes.SYSTEM);
    return session;
  }

  public async findSessionByUser(userId: string, scope: AppDomain.Scopes): Promise<AppDomain.Session> {
    this.logger.log(`findSessionByUser: ${userId}`);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return await this.createSession(user, scope);
  }

  private createPayload(user: User, scope: AppDomain.Scopes): AppDomain.TokenPayload {
    const payload: AppDomain.TokenPayload = {
      sub: user.id,
      role: user.role.id,
      scope: scope.toString(),
    };
    this.logger.log('payload: ' + JSON.stringify(payload));
    return payload;
  }

  private async createAccessToken(user: User, scope: AppDomain.Scopes): Promise<string> {
    this.logger.log(`createAccessToken`);
    const payload: AppDomain.TokenPayload = this.createPayload(user, scope);
    const accessToken = await this.jwtService.signAsync(payload);
    const event = SecurityDomain.AUDIT_EVENT_CODES.LOGIN;
    this.auditLogService.createAuditLog(user.id, event);
    return accessToken;
  }

  public async sessionCode(sessionCode: SessionCodeRequestDto): Promise<string | boolean | AppDomain.Session> {
    try {
      this.logger.log(`sessionCode`);
      if (sessionCode.operation === this.OPERATION_ASK) {
        const storeId = await this.getStoreId(sessionCode);
        if (!storeId) {
          throw new InternalServerErrorException();
        }
        return await this.handleAskOperation(sessionCode, storeId);
      } else if (sessionCode.operation === this.OPERATION_VERIFY) {
        const storeId = await this.getStoreId(sessionCode, false);
        if (!storeId) {
          throw new InternalServerErrorException();
        }
        return await this.handleVerifyOperation(sessionCode, storeId);
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async getFirstStoreByUserEmail(email: string, needToConcateEmail = true): Promise<string> {
    if (needToConcateEmail) {
      email = `${email}${this.EMAIL_CONCAT}`;
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user?.stores?.length) {
      return null;
    }

    return user.stores[0].id;
  }

  private async getStoreId(sessionCode: any, needToConcateEmail = true): Promise<string> {
    return sessionCode.storeId
      ? sessionCode.storeId
      : await this.getFirstStoreByUserEmail(sessionCode.email, needToConcateEmail);
  }

  private async handleAskOperation(sessionCode: SessionCodeRequestDto, storeId: string): Promise<boolean | string> {
    this.logger.log(`handleAskOperation`);
    const user = await this.validateUser(sessionCode.email, storeId);
    if (!user) {
      return false;
    }
    const code = await this.generateSessionCode(storeId, user.id);
    await this.sendEmail(user, code);
    return user.email;
  }

  private async handleVerifyOperation(
    sessionCode: SessionCodeRequestDto,
    storeId: string,
  ): Promise<boolean | AppDomain.Session> {
    this.logger.log(`handleVerifyOperation`);
    const validCode = await this.passcodeCredentialService.verifyCode(sessionCode.code, storeId, sessionCode.email);
    if (!validCode) {
      return false;
    }
    return await this.createSession(validCode.user, AppDomain.Scopes.TOUCH);
  }

  private async validateUser(email: string, storeId: string): Promise<User> {
    const fullEmail = `${email}${this.EMAIL_CONCAT}`;
    const user: User = await this.userRepository.findByEmailAndStoreAndMethodCode(fullEmail, storeId);

    return user;
  }

  private generateSessionCode(storeId: string, userId: string): Promise<number> {
    return this.passcodeCredentialService.generateUniqueCode(storeId, userId);
  }

  private async sendEmail(user: User, code: number): Promise<void> {
    this.logger.log(`sendEmail`);
    await this.emailService.sendEmail({
      template: './generateCode',
      subject: this.SUBJECT,
      to: user.email,
      context: {
        code: code,
        name: 'TOUCH Operacional',
      },
    });
  }

  private formatPermissions(permissions: Permission[]): Record<string, string[]> {
    return permissions.reduce((acc, permission) => {
      const moduleCode = permission.module.code;
      if (!acc[moduleCode]) {
        acc[moduleCode] = [];
      }
      acc[moduleCode].push(permission.code);
      return acc;
    }, {});
  }

  private async createSession(user: User, scope: AppDomain.Scopes): Promise<AppDomain.Session> {
    const permissions = user.role.permissions ? this.formatPermissions(user.role.permissions) : {};
    const userDto = plainToInstance(UserDto, user);
    userDto.role = {
      id: user.role.id,
      name: user.role.name,
    };
    userDto.stores = user.stores.map((store) => {
      return {
        id: store.id,
        name: store.name,
      };
    });
    userDto.groupedPermissions = permissions;
    const accessToken = await this.createAccessToken(user, scope);
    console.log('accessToken', accessToken);
    return {
      accessToken,
      user: userDto,
    };
  }
}
