import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { AuditLogService } from 'src/modules/security/audit-log/audit-log.service';
import { UserDto } from './users.dto';
import { SecurityDomain } from 'src/shared/domain/security.domain';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(user): Promise<UserDto[]> {
    this.logger.log('findAll');
    const users: User[] = await this.userRepository.findAll();
    const event = SecurityDomain.AUDIT_EVENT_CODES.LIST_USERS;
    this.auditLogService.createAuditLog(user.sub, event);
    return users.map((user) => plainToInstance(UserDto, user));
  }

  async findByRut(rut: string): Promise<UserDto> {
    this.logger.log(`findByRut: ${rut}`);
    const user = await this.userRepository.findByRut(rut);
    if (!user) {
      return null;
    }
    return plainToInstance(UserDto, user);
  }

  async save(user: User): Promise<User> {
    this.logger.log('save');
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    this.logger.log(`findById: ${id}`);
    return this.userRepository.findById(id);
  }
}
