import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogRepository } from 'src/infrastructure/database/repositories/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly logger: Logger,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}
  async create(createAuditLogDto: CreateAuditLogDto) {
    try {
      this.logger.log('create audit log');
      return await this.auditLogRepository.create(createAuditLogDto);
    } catch (error) {
      this.logger.error(error);
    }
  }

  createAuditLog(userId: string, code: string): void {
    try {
      const auditLogDto = new CreateAuditLogDto();
      auditLogDto.userId = userId;
      auditLogDto.eventTypeCode = code;
      this.create(auditLogDto);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
