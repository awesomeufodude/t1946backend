import { BusinessLine } from '../entities/business-line.entity';
import { AbstractRepository } from './abstract.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BussinessLineRepository extends AbstractRepository<BusinessLine> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(BusinessLine));
  }

  async findById(id: number) {
    this.logger.log('findById');
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findAllActive() {
    this.logger.log('findAll');
    return await this.repository.find({
      order: {
        order: 'ASC',
      },
    });
  }
}
