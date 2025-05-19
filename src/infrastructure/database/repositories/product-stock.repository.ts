import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';
import { ProductStock } from '../entities/product-stock.entity';

@Injectable()
export class ProductStockRepository extends AbstractRepository<ProductStock> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(ProductStock));
  }
}
