import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { CatalogVehicleBrand } from 'src/infrastructure/database/entities/catalog-vehicle-brand.entity';
import { CatalogVehicleModel } from 'src/infrastructure/database/entities/catalog-vehicle-model.entity';
import { CatalogVehicleVersion } from 'src/infrastructure/database/entities/catalog-vehicle-version.entity';
import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { CatalogVehicleModelRepository } from 'src/infrastructure/database/repositories/catalog-vehicle-model.repository';
import { CatalogVehicleVersionRepository } from 'src/infrastructure/database/repositories/catalog-vehicle-version.repository';
import { CatalogVehicleRepository } from 'src/infrastructure/database/repositories/catalog-vehicle.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { BrandDTO, ModelDTO, VersionDTO } from 'src/infrastructure/wheelsize/wheelsize.dto';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
import { CatalogVehicleBrandRepository } from '../../../infrastructure/database/repositories/catalog-vehicle-brand.repository';
import {
  BrandDto,
  CreateVehicleByPlateDto,
  CreateVehicleRequestDto,
  ModelDto,
  ResponseCreateVehicleByPlateDto,
  ResponseHistorical,
  VehicleDto,
  VersionDto,
} from './vehicles.dto';
import { mockVehicleEquifaxAH, mockVehicleEquifaxIR, mockVehicleEquifaxSY } from './mockVehicle';
@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  private readonly mode: boolean;
  constructor(
    private readonly vehiclesRepository: VehiclesRepository,
    private readonly catalogVehicleBrandRepository: CatalogVehicleBrandRepository,
    private readonly catalogVehicleModelRepository: CatalogVehicleModelRepository,
    private readonly catalogVehicleVersionRepository: CatalogVehicleVersionRepository,
    private readonly catalogVehicleRepository: CatalogVehicleRepository,
    private readonly wheelSizeService: WheelSizeService,
    private readonly workOrderRepository: WorkorderRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.mode = process.env.DEV_WHEELSIZE_EQUIFAX === 'TRUE';
  }

  async create(createVehicleDto: CreateVehicleRequestDto): Promise<VehicleDto> {
    this.logger.log(`Creating vehicle with data: ${JSON.stringify(createVehicleDto)}`);

    const vehicle = new Vehicle();
    vehicle.vehicleCatalog = { id: createVehicleDto.vehicleCatalogId } as any;
    vehicle.plate = createVehicleDto.plate;
    vehicle.color = createVehicleDto.color;

    const createdVehicle = await this.vehiclesRepository.create(vehicle);

    return {
      id: createdVehicle.id,
      vehicleCatalogId: createdVehicle.vehicleCatalog.id,
      plate: createdVehicle.plate,
      color: createdVehicle.color,
      createdAt: createdVehicle.createdAt,
      updatedAt: createdVehicle.updatedAt,
    };
  }

  async findAll(): Promise<VehicleDto[]> {
    this.logger.log('Retrieving all vehicles');
    const vehicles = await this.vehiclesRepository.findAll();

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      vehicleCatalogId: vehicle.vehicleCatalog.id,
      plate: vehicle.plate,
      color: vehicle.color,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }));
  }

  async findByPlate(country: string, plate: string): Promise<ResponseCreateVehicleByPlateDto | null> {
    try {
      this.logger.log(`findByPlate: plate ${plate} country: ${country}`);
      const vehicle = await this.vehiclesRepository.findByPlate(country.toUpperCase(), plate.toUpperCase());
      if (!vehicle) {
        const vehicleEquifax = this.mode
          ? this.getMockVehicleByPlate(plate.toUpperCase())
          : await this.vehiclesRepository.findByPlateEquifax(plate.toUpperCase());
        return vehicleEquifax ? this.formatVehicleResponseEquifax(vehicleEquifax) : null;
      }

      return this.formatVehicleResponse(vehicle);
    } catch (error) {
      this.logger.error('Error en findByPlate', error);
      throw new InternalServerErrorException('Hubo un error al obtener findByPlate');
    }
  }

  async findOdometerByLastWorkOrder(vehicle: any) {
    const workOrders = await this.workOrderRepository.findWorkOrderByVehicle(vehicle);

    if (!workOrders?.length) {
      return null;
    }
    const lastWorkOrder = workOrders[0];
    return lastWorkOrder;
  }

  private getMockVehicleByPlate(plate: string) {
    const firstLetter = plate.charAt(0).toUpperCase();

    if ('A' <= firstLetter && firstLetter <= 'H') {
      return mockVehicleEquifaxAH;
    } else if ('I' <= firstLetter && firstLetter <= 'R') {
      return mockVehicleEquifaxIR;
    } else if ('S' <= firstLetter && firstLetter <= 'Y') {
      return mockVehicleEquifaxSY;
    } else {
      return null;
    }
  }

  async createByPlate(
    country: string,
    plate: string,
    vehicle: CreateVehicleByPlateDto,
  ): Promise<ResponseCreateVehicleByPlateDto> {
    this.logger.log(`createByPlate: ${country} ${plate}`);
    const catalogBrand = await this.getOrCreateCatalogBrand(vehicle.brand);
    const catalogModel = await this.getOrCreateCatalogModel(vehicle.model, catalogBrand);
    const catalogVersion = await this.getOrCreateCatalogVersion(vehicle.version, catalogModel);

    const vehicleFinal = await this.getOrCreateVehicle(
      country,
      plate,
      vehicle,
      catalogBrand,
      catalogModel,
      catalogVersion,
    );

    return this.formatVehicleResponse({
      ...vehicleFinal,
      vehicleCatalog: {
        brand: catalogBrand,
        model: catalogModel,
        version: catalogVersion,
        year: vehicle.year,
      },
    } as Vehicle);
  }

  formatVehicleResponse(vehicle: Vehicle): ResponseCreateVehicleByPlateDto {
    return {
      id: vehicle.id,
      brand: vehicle.vehicleCatalog?.brand ? plainToInstance(BrandDto, vehicle.vehicleCatalog.brand) : null,
      model: vehicle.vehicleCatalog?.model ? plainToInstance(ModelDto, vehicle.vehicleCatalog.model) : null,
      version: vehicle.vehicleCatalog?.version ? plainToInstance(VersionDto, vehicle.vehicleCatalog.version) : null,
      year: vehicle.vehicleCatalog?.year || null,
      plate: vehicle.plate,
      plateCountry: vehicle.plateCountry,
      color: vehicle.color,
      odometer: vehicle.odometer,
      odometerUpdateDate: vehicle.odometerUpdateDate ? vehicle.odometerUpdateDate.toISOString() : '',
      owner: vehicle.owner ?? '',
      technicalReviewMonth: vehicle.technicalReviewMonth ?? '',
    };
  }

  private formatVehicleResponseEquifax(vehicle: any): ResponseCreateVehicleByPlateDto {
    return {
      brand: { id: vehicle.ws_brand, codeWs: vehicle.ws_brand },
      model: { id: vehicle.ws_model, codeWs: vehicle.ws_model },
      year: vehicle.year,
      color: vehicle.color,
    };
  }

  private async getOrCreateCatalogBrand(brand: BrandDto): Promise<CatalogVehicleBrand | null> {
    this.logger.log(`getOrCreateCatalogBrand: ${JSON.stringify(brand)}`);
    if (!brand.name) return null;
    let catalogBrand = await this.catalogVehicleBrandRepository.findByName(brand.name);
    if (!catalogBrand) {
      catalogBrand = await this.catalogVehicleBrandRepository.create({
        name: brand.name,
        codeWs: brand.codeWs || null,
        imgUrl: brand.imgUrl || null,
      });
    }
    return catalogBrand;
  }

  private async getOrCreateCatalogModel(
    model: ModelDto,
    catalogoBrand?: BrandDto,
  ): Promise<CatalogVehicleModel | null> {
    this.logger.log(`getOrCreateCatalogModel: ${JSON.stringify(model)}`);
    if (!model.name) return null;

    let catalogModel = await this.catalogVehicleModelRepository.findByName(model.name);

    if (!catalogModel) {
      catalogModel = await this.catalogVehicleModelRepository.create({
        name: model.name,
        brand: catalogoBrand,
        codeWs: model.codeWs || null,
      });
    }

    return catalogModel;
  }

  private async getOrCreateCatalogVersion(
    version: VersionDto,
    catalogoModel?: ModelDto,
  ): Promise<CatalogVehicleVersion | null> {
    this.logger.log(`getOrCreateCatalogVersion: ${JSON.stringify(version)}`);
    if (!version.codeWs) return null;

    let catalogVersion = await this.catalogVehicleVersionRepository.findByCodeWs(version.codeWs);
    if (!catalogVersion) {
      catalogVersion = await this.catalogVehicleVersionRepository.create({
        name: version.name,
        model: catalogoModel,
        codeWs: version.codeWs || null,
        imgUrl: version.imgUrl || null,
      });
    }

    return catalogVersion;
  }

  private async getOrCreateVehicle(
    country: string,
    plate: string,
    vehicle: CreateVehicleByPlateDto,
    catalogBrand: CatalogVehicleBrand | null,
    catalogModel: CatalogVehicleModel | null,
    catalogVersion: CatalogVehicleVersion | null,
  ): Promise<Vehicle> {
    this.logger.log('getOrCreateVehicle', country, plate, vehicle);
    const findedVehicle = await this.vehiclesRepository.findByPlate(country, plate.toUpperCase());
    const catalogVehicle = await this.catalogVehicleRepository.createCatalogVehicle({
      brand: catalogBrand,
      model: catalogModel,
      version: catalogVersion,
      year: vehicle.year,
    });
    if (findedVehicle) {
      const lastWorkOrder = await this.findOdometerByLastWorkOrder(findedVehicle);
      if (lastWorkOrder) {
        lastWorkOrder.odometer = vehicle.odometer;
        await this.workOrderRepository.update(String(lastWorkOrder.id), {
          ...lastWorkOrder,
          odometer: lastWorkOrder.odometer,
        });
      }
      const updatedVehicle = {
        ...findedVehicle,
        odometer: vehicle.odometer,
        odometerUpdateDate: lastWorkOrder ? lastWorkOrder.createdAt : null,
        vehicleCatalog: catalogVehicle,
        owner: vehicle.owner ?? '',
        technicalReviewMonth: vehicle.technicalReviewMonth ?? '',
        plateCountry: country,
      };
      await this.vehiclesRepository.save(updatedVehicle);
      return updatedVehicle;
    } else {
      const newVehicle = new Vehicle();
      newVehicle.plate = plate.toUpperCase();
      newVehicle.plateCountry = country;
      newVehicle.odometer = vehicle.odometer;
      newVehicle.odometerUpdateDate = null;
      newVehicle.vehicleCatalog = catalogVehicle;

      await this.vehiclesRepository.save(newVehicle);
      return newVehicle;
    }
  }

  async getBrands() {
    const cacheKey = 'brands';
    const cachedBrands = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedBrands) {
      this.logger.log('Obtengo datos de cache de brands');
      return cachedBrands;
    }
    try {
      this.logger.log('No obtengo datos de cache de brands');
      const brands = await this.wheelSizeService.getBrands();
      const formattedBrands = brands.map((brand) => new BrandDTO(brand));

      await this.cacheManager.set(cacheKey, formattedBrands);

      return formattedBrands;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error fetching brands');
    }
  }

  async getModelsByBrand(brand: string, year: string) {
    const cacheKey = `models_${brand}_${year}`;
    const cachedModels = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedModels) {
      this.logger.log(`Obtengo datos de cache de models de brand ${brand}`);
      return cachedModels;
    }
    try {
      this.logger.log(`No obtengo datos de cache de models de brand ${brand}`);
      const models = await this.wheelSizeService.getModels(brand, year);
      const formattedModels = models.map((model) => new ModelDTO(model));

      await this.cacheManager.set(cacheKey, formattedModels);

      return formattedModels;
    } catch (error) {
      throw new InternalServerErrorException(`Error fetching models for brand ${brand}: ${error.message}`);
    }
  }

  async getYearsByModel(brand: string) {
    const cacheKey = `years_${brand}`;
    const cachedYears = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedYears) {
      this.logger.log(`Obtengo datos de cache de years de brand ${brand}`);
      return cachedYears;
    }

    try {
      this.logger.log(`No obtengo datos de cache de years de brand ${brand}`);
      const years = await this.wheelSizeService.getYears(brand);
      const yearFormatted = years.map((year) => year.slug);
      await this.cacheManager.set(cacheKey, yearFormatted);

      return yearFormatted;
    } catch (error) {
      throw new InternalServerErrorException(`Error fetching years for  brand ${brand}: ${error.message}`);
    }
  }

  async getVersionsByYear(brand: string, model: string, year: string) {
    const cacheKey = `versions_${brand}_${model}_${year}`;
    const cachedVersions = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedVersions) {
      this.logger.log(`Obtengo datos de cache de versions de year ${year} de model ${model} de brand ${brand}`);
      return cachedVersions;
    }
    try {
      this.logger.log(`No obtengo datos de cache de versions de year ${year} de model ${model} de brand ${brand}`);
      const versions = await this.wheelSizeService.getVersions(brand, model, year);
      const formattedVersions = versions.reduce((acc, version) => {
        const versionDTO = new VersionDTO(version);
        if (!acc.some((v) => v.name === versionDTO.name)) {
          acc.push(versionDTO);
        }
        return acc;
      }, []);
      await this.cacheManager.set(cacheKey, formattedVersions);

      return formattedVersions;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching versions for year ${year} of model ${model} of brand ${brand}: ${error.message}`,
      );
    }
  }

  async getHistoryByPlate(country: string, plate: string) {
    this.logger.log(`getHistoryByPlate: ${country} ${plate}`);
    const vehicle = await this.vehiclesRepository.findByPlate(country, plate);
    const workOrders = await this.workOrderRepository.findWorkOrderByVehicle(vehicle);
    if (!workOrders) {
      return [];
    }
    return workOrders.map((workOrder) => new ResponseHistorical(workOrder));
  }
}
