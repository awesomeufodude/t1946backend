import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomerOption } from '../entities/customer-option.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CustomerOptionRepository extends AbstractRepository<CustomerOption> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CustomerOption));
  }

  async findByCustomerId(customerId: string) {
    this.logger.log('findByCustomerId');
    return await this.repository.findOne({
      where: {
        customer: { id: customerId },
      },
    });
  }

  async save(customerOption: CustomerOption) {
    this.logger.log('save');
    return await this.repository.save(customerOption);
  }
}
