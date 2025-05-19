import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogVehicle } from '../entities/catalog-vehicle.entity';
import { AbstractRepository } from './abstract.repository';
import { CatalogVehicleBrand } from '../entities/catalog-vehicle-brand.entity';
import { CatalogVehicleModel } from '../entities/catalog-vehicle-model.entity';
import { CatalogVehicleVersion } from '../entities/catalog-vehicle-version.entity';

@Injectable()
export class CatalogVehicleRepository extends AbstractRepository<CatalogVehicle> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CatalogVehicle));
  }

  async findCatalogVehicle(
    brandId: string,
    modelId: string,
    versionId: string,
    year: number,
  ): Promise<CatalogVehicle | null> {
    this.logger.log(
      `Finding CatalogVehicle with brandId: ${brandId}, modelId: ${modelId}, versionId: ${versionId}, year: ${year}`,
    );

    return await this.repository.findOne({
      where: {
        brand: { id: brandId },
        model: { id: modelId },
        version: { id: versionId },
        year,
      },
      relations: ['brand', 'model', 'version'],
    });
  }

  async createCatalogVehicle({
    brand,
    model,
    version,
    year,
  }: {
    brand: CatalogVehicleBrand;
    model: CatalogVehicleModel;
    version: CatalogVehicleVersion;
    year: number;
  }): Promise<CatalogVehicle> {
    const catalogVehicle = this.repository.create({
      brand,
      model,
      version,
      year,
    });

    return await this.save(catalogVehicle);
  }

  async save(catalogVehicle: CatalogVehicle): Promise<CatalogVehicle> {
    return this.repository.save(catalogVehicle);
  }
}
