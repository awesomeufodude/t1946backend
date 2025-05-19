import { faker } from '@faker-js/faker';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { CreateVehicleByPlateDto, CreateVehicleRequestDto, ResponseHistorical } from './vehicles.dto';
import { VehiclesService } from './vehicles.service';
import { CatalogVehicleBrandRepository } from 'src/infrastructure/database/repositories/catalog-vehicle-brand.repository';
import { CatalogVehicleModelRepository } from 'src/infrastructure/database/repositories/catalog-vehicle-model.repository';
import { CatalogVehicleVersionRepository } from 'src/infrastructure/database/repositories/catalog-vehicle-version.repository';
import { CatalogVehicleRepository } from 'src/infrastructure/database/repositories/catalog-vehicle.repository';
import { CatalogVehicleBrand } from 'src/infrastructure/database/entities/catalog-vehicle-brand.entity';
import { CatalogVehicleVersion } from 'src/infrastructure/database/entities/catalog-vehicle-version.entity';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { createMockWorkorder } from 'src/modules/sales/workorders/workorders.service.spec';
import { createMockUser } from 'src/modules/admin/users/users.service.spec';

function createMockVehicle(vehicleCatalogId?: string): Vehicle {
  const vehicle = new Vehicle();
  vehicle.id = faker.string.uuid();
  vehicle.plateCountry = 'CL';
  vehicle.plate = faker.vehicle.vrm();
  vehicle.color = faker.vehicle.color();
  vehicle.vehicleCatalog = { id: vehicleCatalogId || faker.string.uuid() } as any;
  vehicle.createdAt = new Date();
  vehicle.updatedAt = new Date();
  return vehicle;
}

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepository: jest.Mocked<VehiclesRepository>;
  let brandRepository: jest.Mocked<CatalogVehicleBrandRepository>;
  let modelRepository: jest.Mocked<CatalogVehicleModelRepository>;
  let versionRepository: jest.Mocked<CatalogVehicleVersionRepository>;
  let workorderRepository: jest.Mocked<WorkorderRepository>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VehiclesRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPlate: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CatalogVehicleBrandRepository,
          useValue: { findById: jest.fn(), create: jest.fn(), findByName: jest.fn() },
        },
        {
          provide: CatalogVehicleModelRepository,
          useValue: { findById: jest.fn(), create: jest.fn(), findByName: jest.fn() },
        },
        {
          provide: CatalogVehicleVersionRepository,
          useValue: { findById: jest.fn(), create: jest.fn(), findByName: jest.fn() },
        },
        {
          provide: CatalogVehicleRepository,
          useValue: { createCatalogVehicle: jest.fn() },
        },
        {
          provide: WheelSizeService,
          useValue: { getBrands: jest.fn(), getModels: jest.fn(), getYears: jest.fn(), getVersions: jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
        {
          provide: WorkorderRepository,
          useValue: { findWorkOrderByVehicle: jest.fn(), update: jest.fn() },
        },
        Logger,
      ],
    }).compile();
    service = module.get<VehiclesService>(VehiclesService);
    vehicleRepository = module.get(VehiclesRepository);
    brandRepository = module.get(CatalogVehicleBrandRepository);
    modelRepository = module.get(CatalogVehicleModelRepository);
    versionRepository = module.get(CatalogVehicleVersionRepository);
    workorderRepository = module.get(WorkorderRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a VehicleDto', async () => {
      const vehicleCatalogId = faker.string.uuid();
      const mockVehicle = createMockVehicle(vehicleCatalogId);
      const createVehicleDto: CreateVehicleRequestDto = {
        vehicleCatalogId,
        plateCountry: 'CL',
        plate: mockVehicle.plate,
        color: mockVehicle.color,
        year: 2020,
      };

      vehicleRepository.create.mockResolvedValue(mockVehicle);

      const result = await service.create(createVehicleDto);

      expect(result).toEqual({
        id: mockVehicle.id,
        vehicleCatalogId,
        plate: mockVehicle.plate,
        color: mockVehicle.color,
        createdAt: mockVehicle.createdAt,
        updatedAt: mockVehicle.updatedAt,
      });
      expect(vehicleRepository.create).toHaveBeenCalledWith(expect.any(Vehicle));
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      vehicleRepository.findAll.mockResolvedValue(mockVehicles);

      const result = await service.findAll();

      expect(result).toEqual(
        mockVehicles.map((vehicle) => ({
          id: vehicle.id,
          vehicleCatalogId: vehicle.vehicleCatalog?.id,
          plate: vehicle.plate,
          color: vehicle.color,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
        })),
      );
      expect(vehicleRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findByPlate', () => {
    it('should return a vehicle by plate', async () => {
      const mockVehicle = createMockVehicle();
      mockVehicle.plateCountry = 'CL';

      vehicleRepository.findByPlate.mockResolvedValue(mockVehicle);

      const result = await service.findByPlate('CL', mockVehicle.plate);

      expect(result).toEqual({
        id: mockVehicle.id,
        brand: null,
        model: null,
        version: null,
        year: null,
        plate: mockVehicle.plate,
        plateCountry: mockVehicle.plateCountry,
        color: mockVehicle.color,
        odometer: undefined,
        odometerUpdateDate: '',
        owner: '',
        technicalReviewMonth: '',
      });
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith('CL', mockVehicle.plate.toUpperCase());
    });

    it('should throw an error if vehicle not found', async () => {
      vehicleRepository.findByPlate.mockRejectedValueOnce(new Error('Vehicle not found'));

      await expect(service.findByPlate('CL', 'ZZZZ91')).rejects.toThrow(InternalServerErrorException);

      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith('CL', 'ZZZZ91');
    });
  });

  describe('createByPlate', () => {
    it('should create or update a vehicle by plate', async () => {
      const mockVehicle = createMockVehicle();

      const mockBrand: CatalogVehicleBrand = {
        id: '1',
        name: 'BRANDNAME',
        vehicles: [],
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockModel = {
        id: '1',
        name: 'MODEL X',
        vehicles: [],
        brand: mockBrand,
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVersion: CatalogVehicleVersion = {
        id: '1',
        name: 'VERSION 1',
        vehicles: [],
        model: mockModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      brandRepository.findById.mockResolvedValue(mockBrand);
      modelRepository.findById.mockResolvedValue(mockModel);
      versionRepository.findById.mockResolvedValue(mockVersion);
      vehicleRepository.findByPlate.mockResolvedValue(mockVehicle);

      const createDto: CreateVehicleByPlateDto = {
        brand: mockBrand,
        model: mockModel,
        version: mockVersion,
        year: 2020,
        odometer: 15000,
      };

      const result = await service.createByPlate('CL', mockVehicle.plate, createDto);

      expect(result).toMatchObject({
        id: mockVehicle.id,
        brand: expect.any(Object),
        model: expect.any(Object),
        version: expect.any(Object),
        year: 2020,
        plate: mockVehicle.plate,
        plateCountry: mockVehicle.plateCountry,
        color: mockVehicle.color,
        odometer: 15000,
      });
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith('CL', mockVehicle.plate);
      expect(result.brand);
      expect(result.model);
      expect(result.version);
    });
  });

  describe('getHistoryByPlate', () => {
    it('should return the history of a vehicle by plate', async () => {
      const mockVehicle = createMockVehicle();
      const mockUser = createMockUser();
      const mockWorkorders = [
        {
          ...createMockWorkorder(mockUser),
          customer: {
            ...createMockWorkorder(mockUser).customer,
            customerPeople: {
              id: 1,
              email: 'test@example.com',
              name: 'OldName',
              lastname: 'OldLastname',
              secondLastname: 'OldSecondLastname',
              phoneZone: 123,
              phoneNumber: 4567890,
              address: 'Old Address',
              addressLatitude: 0.0,
              addressLongitude: 0.0,
              documentId: '12345678-9',
              documentType: 'RUT',
              customerCategory: null,
              consultationChannel: null,
              addressNumber: null,
              addresComment: null,
              createdAt: faker.date.past(),
              updatedAt: faker.date.recent(),
              customer: createMockWorkorder(mockUser).customer,
            },
          },
        },
      ];
      vehicleRepository.findByPlate.mockResolvedValue(mockVehicle);
      workorderRepository.findWorkOrderByVehicle.mockResolvedValue(mockWorkorders);
      const result = await service.getHistoryByPlate('CL', mockVehicle.plate);
      expect(result).toEqual(mockWorkorders.map((workOrder) => new ResponseHistorical(workOrder)));
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith('CL', mockVehicle.plate);
      expect(workorderRepository.findWorkOrderByVehicle).toHaveBeenCalledWith(mockVehicle);
    });

    it('should return an empty array if no work orders found', async () => {
      const mockVehicle = createMockVehicle();
      vehicleRepository.findByPlate.mockResolvedValue(mockVehicle);
      workorderRepository.findWorkOrderByVehicle.mockResolvedValue([]);
      const result = await service.getHistoryByPlate('CL', mockVehicle.plate);
      expect(result).toEqual([]);
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith('CL', mockVehicle.plate);
      expect(workorderRepository.findWorkOrderByVehicle).toHaveBeenCalledWith(mockVehicle);
    });
  });
});
