import { Inject, Injectable, Logger } from '@nestjs/common';
import { Service } from '../entities/service.entity';
import { AbstractRepository } from './abstract.repository';
import { DataSource, In } from 'typeorm';

@Injectable()
export class ServiceRepository extends AbstractRepository<Service> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Service));
  }

  async findByCodeAndStore(code: string, storeId: string): Promise<Service> {
    this.logger.log('findByCodeAndStore');
    const product = await this.repository.findOne({
      where: { code: code, prices: { storeId } },
      relations: ['prices'],
    });
    return product;
  }

  async findByCodes(codes: string[]): Promise<Service[]> {
    this.logger.log('findByCodes');
    return await this.repository.find({
      where: { code: In(codes) },
    });
  }

  async findById(code: string): Promise<Service> {
    this.logger.log('findById');
    const service = await this.repository.findOne({
      where: { code },
      relations: ['businessLine'],
    });
    return service;
  }
}
