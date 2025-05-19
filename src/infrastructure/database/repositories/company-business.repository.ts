import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyBusiness } from '../entities/company-business.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CompanyBusinessRepository extends AbstractRepository<CompanyBusiness> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CompanyBusiness));
  }

  async findAll() {
    this.logger.log('findAll');
    return await this.repository.find();
  }

  async findOne(id: number) {
    this.logger.log('findOne', id);
    return await this.repository.findOne({
      where: { id },
    });
  }
}
