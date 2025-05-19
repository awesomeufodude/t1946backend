import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceItems } from '../entities/service-items ';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class ServiceItemsRepository extends AbstractRepository<ServiceItems> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(ServiceItems));
  }

  async findAll(): Promise<ServiceItems[]> {
    this.logger.log('findAll ');
    return this.repository.find();
  }
}
