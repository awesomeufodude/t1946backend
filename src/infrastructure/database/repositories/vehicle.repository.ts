import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Equifax2024 } from '../entities/equifax-2024.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class VehiclesRepository extends AbstractRepository<Vehicle> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    @Inject('EQUIFAX_DATA_SOURCE') private readonly equifaxDataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Vehicle));
  }
  async search(search: string): Promise<Vehicle[]> {
    this.logger.log(`Searching vehicles with search term: ${search}`);

    const plateRegexOld = /^[A-Z]{2}[A-Z0-9]{2}\d{2}$/i;
    const plateRegexNew = /^[A-Z]{2}\d{3}[A-Z]{2}$/i;

    if (plateRegexOld.test(search) || plateRegexNew.test(search)) {
      return await this.searchByPlate(search);
    }

    return await this.searchByBrandOrModel(search);
  }

  private async searchByPlate(search: string): Promise<Vehicle[]> {
    return this.getVehicleQuery()
      .where('vehicle.plate ILIKE :search', { search: `%${search}%` })
      .getMany();
  }

  private async searchByBrandOrModel(search: string): Promise<Vehicle[]> {
    return this.getVehicleQuery()
      .andWhere(`CONCAT(brand.name, ' ', model.name) ILIKE :search`, { search: `%${search}%` })
      .getMany();
  }

  private getVehicleQuery() {
    return this.repository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.vehicleCatalog', 'catalog')
      .leftJoinAndSelect('catalog.brand', 'brand')
      .leftJoinAndSelect('catalog.model', 'model')
      .leftJoinAndSelect('catalog.version', 'version')
      .leftJoinAndSelect('vehicle.workorders', 'workorders')
      .leftJoinAndSelect('workorders.status', 'status');
  }

  async findByPlate(plateCountry: string, plate: string): Promise<Vehicle> {
    this.logger.log(`findByPlate: ${plateCountry} ${plate}`);
    return this.repository.findOne({
      where: {
        plateCountry,
        plate,
      },
    });
  }

  async findById(id: string): Promise<Vehicle> {
    this.logger.log(`findById: ${id}`);
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }
  async findByIds(ids: string[]): Promise<Vehicle[]> {
    this.logger.log(`findByIds: ${ids}`);

    const vehicles = await this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['workorders'],
    });

    return vehicles;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    return this.repository.save(vehicle);
  }

  async findByPlateEquifax(plate: string): Promise<any | null> {
    this.logger.log(`findByPlateEquifax: ${plate}`);
    const result = await this.equifaxDataSource
      .getRepository(Equifax2024)
      .createQueryBuilder('eq')
      .select([
        'eq."MARCA"',
        'eq."MODELO"',
        'eq."ANIO_FABRICACION"',
        'eq."COLOR"',
        'mh.brand AS ws_brand',
        'mh.slug AS ws_model',
      ])
      .leftJoin('models_homologations', 'mh', 'eq."MARCA" = mh."MARCA" AND eq."MODELO" = mh."MODELO"')
      .where('eq."PPU" = :plate', { plate })
      .getRawOne();

    if (!result) {
      return null;
    }
    this.logger.log(`findByPlateEquifax result: ${result} by plate: ${plate}`);
    return {
      brand: result.MARCA,
      model: result.MODELO,
      year: result.ANIO_FABRICACION,
      color: result.COLOR,
      ws_brand: result.ws_brand,
      ws_model: result.ws_model,
    };
  }
}
