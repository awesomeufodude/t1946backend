import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CatalogVehicleVersion } from '../entities/catalog-vehicle-version.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CatalogVehicleVersionRepository extends AbstractRepository<CatalogVehicleVersion> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CatalogVehicleVersion));
  }

  async findByName(name: string): Promise<CatalogVehicleVersion> {
    this.logger.log(`findByName: ${name}`);
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }

  async findById(id: string): Promise<CatalogVehicleVersion> {
    this.logger.log(`findById: ${id}`);
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findByCodeWs(codeWs: string): Promise<CatalogVehicleVersion> {
    this.logger.log(`findByCodeWs: ${codeWs}`);
    return this.repository.findOne({
      where: {
        codeWs,
      },
    });
  }

  async save(catalogVehicleVersion: CatalogVehicleVersion): Promise<CatalogVehicleVersion> {
    return this.repository.save(catalogVehicleVersion);
  }
}
