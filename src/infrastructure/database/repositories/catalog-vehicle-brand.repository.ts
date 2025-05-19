import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogVehicleBrand } from '../entities/catalog-vehicle-brand.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CatalogVehicleBrandRepository extends AbstractRepository<CatalogVehicleBrand> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CatalogVehicleBrand));
  }

  async findByName(name: string): Promise<CatalogVehicleBrand> {
    this.logger.log(`findByName: ${name}`);
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }

  async findById(id: string): Promise<CatalogVehicleBrand> {
    this.logger.log(`findById: ${id}`);
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async save(catalogVehicleBrand: CatalogVehicleBrand): Promise<CatalogVehicleBrand> {
    return this.repository.save(catalogVehicleBrand);
  }
}
