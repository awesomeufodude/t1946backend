import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppointmentStatus } from '../entities/appointment-status.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class AppointmentStatusRepository extends AbstractRepository<AppointmentStatus> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(AppointmentStatus));
  }

  async findByCode(code: string) {
    return await this.repository.findOne({ where: { code } });
  }
}
