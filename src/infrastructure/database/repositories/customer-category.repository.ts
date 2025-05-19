import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomerCategory } from '../entities/customer-category.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CustomerCategoryRepository extends AbstractRepository<CustomerCategory> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CustomerCategory));
  }
}
