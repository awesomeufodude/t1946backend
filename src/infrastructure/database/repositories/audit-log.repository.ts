import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditLog } from '../entities/audit-log.entity';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class AuditLogRepository extends AbstractRepository<AuditLog> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(AuditLog));
  }
}
