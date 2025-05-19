import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogVehicleModel } from '../entities/catalog-vehicle-model.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CatalogVehicleModelRepository extends AbstractRepository<CatalogVehicleModel> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CatalogVehicleModel));
  }

  async findByName(name: string): Promise<CatalogVehicleModel> {
    this.logger.log(`findByName: ${name}`);
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }

  async findById(id: string): Promise<CatalogVehicleModel> {
    this.logger.log(`findById: ${id}`);
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async save(catalogVehicleModel: CatalogVehicleModel): Promise<CatalogVehicleModel> {
    return this.repository.save(catalogVehicleModel);
  }
}
