import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { appConstants } from 'src/config/app.constants';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { IS_NOT_AVAILABLE_IN_TOUCH_KEY, IS_PRIVATE_KEY, IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import { AppDomain } from '../domain/app.domain';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isValidRequest = await this.validateRequest(context);
    if (!isValidRequest) {
      throw new UnauthorizedException();
    }

    const isValidScope = await this.validateScope(context);
    if (!isValidScope) {
      throw new ForbiddenException();
    }

    const hasValidPermissions = await this.validatePermissions(context);
    if (!hasValidPermissions) {
      throw new ForbiddenException();
    }

    return true;
  }

  private getRequest(context: ExecutionContext): any {
    const request = context.switchToHttp().getRequest();
    return request;
  }

  private extractTokenFromHeader(authorizationHeader: string): string | undefined {
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateRequest(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    if (!request.headers.authorization) {
      return false;
    }
    const token = this.extractTokenFromHeader(request.headers.authorization);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: appConstants.JWT_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch {
      return false;
    }
  }

  private async validateScope(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const isNotAvailableInTouch = this.reflector.getAllAndOverride<boolean>(IS_NOT_AVAILABLE_IN_TOUCH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    this.logger.log(`Is not available in touch: ${isNotAvailableInTouch}`);
    if (isNotAvailableInTouch) {
      const userScope = request['user'].scope;
      this.logger.log(`User scope: ${userScope}`);
      if (userScope !== AppDomain.Scopes.SYSTEM.toString()) {
        return false;
      }
    }
    return true;
  }

  private async validatePermissions(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const permissionRequired = this.reflector.getAllAndOverride<AppDomain.Permissions[]>(IS_PRIVATE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.log(`Permission required: ${permissionRequired}`);
    this.logger.log(`Permission required type: ${typeof permissionRequired}`);

    if (!permissionRequired || permissionRequired.length === 0) {
      return true;
    }

    const userRole: string = request['user'].role;
    this.logger.log(`User role: ${userRole}`);

    const roleResponse = await this.roleRepository.findById(userRole);
    if (!roleResponse) {
      return false;
    }

    const userPermissions = roleResponse.permissions.map((permission) => permission.code);
    this.logger.log(`User permissions: ${userPermissions}`);

    const hasValidPermission = permissionRequired.some((requiredPermission) =>
      userPermissions.includes(requiredPermission.toString()),
    );

    this.logger.log(`Has permission: ${hasValidPermission}`);
    return hasValidPermission;
  }
}
