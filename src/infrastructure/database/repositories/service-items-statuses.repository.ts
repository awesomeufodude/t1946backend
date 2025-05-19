import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';
import { ServiceItemsStatuses } from '../entities/service-items-statuses';

@Injectable()
export class ServiceItemsStatusesRepository extends AbstractRepository<ServiceItemsStatuses> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(ServiceItemsStatuses));
  }

  async findAll(): Promise<ServiceItemsStatuses[]> {
    this.logger.log('findAll ');
    return this.repository.find();
  }

  async findByCode(code: string): Promise<ServiceItemsStatuses> {
    this.logger.log('findById');
    return this.repository.findOne({
      where: { code },
    });
  }
}
