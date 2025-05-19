import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ProductTireRepository } from 'src/infrastructure/database/repositories/product-tire.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import { ResponseProfileDto, ResponseRimDto, ResponseWidthDto, MeasuresByWheelsizeDto } from './tires.dto';
import { TiresService } from './tires.service';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';

const mockCombo = {
  id: 1,
  name: 'combo',
  comboItems: [
    {
      id: 1,
      service: {
        code: 'SRV001',
      },
      prices: [
        {
          price: 100,
          store: {
            id: 'store-1',
          },
        },
      ],
    },
  ],
};

describe('TiresService', () => {
  let service: TiresService;
  let productTireRepository: ProductTireRepository;
  let productRepository: ProductRepository;
  let cacheManager: Cache;
  let mockLogger: Partial<Logger>;
  let wheelSizeService: WheelSizeService;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const mockProductTireRepository = {
      findAllWidths: jest.fn().mockResolvedValue([200, 205]),
      findProfilesByWidth: jest.fn().mockResolvedValue([55, 60]),
      findRimsByWidthAndProfile: jest.fn().mockResolvedValue([18, 19]),
    };

    const mockProductRepository = {
      getTiresByMeasures: jest.fn().mockResolvedValue([]),
      getProductCombo: jest.fn().mockResolvedValue(mockCombo),
    };

    const mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const mockWheelSizeService = {
      getMeasures: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiresService,
        { provide: Logger, useValue: mockLogger },
        { provide: ProductTireRepository, useValue: mockProductTireRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: WheelSizeService, useValue: mockWheelSizeService },
      ],
    }).compile();

    service = module.get<TiresService>(TiresService);
    productTireRepository = module.get<ProductTireRepository>(ProductTireRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    wheelSizeService = module.get<WheelSizeService>(WheelSizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWidthsByTires', () => {
    it('should return cached widths', async () => {
      const cacheKey = 'all_widths';
      const cachedWidths = [200, 205];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedWidths);

      const response = await service.getAllWidthsByTires();

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(response).toEqual(new ResponseWidthDto(cachedWidths));
      expect(productTireRepository.findAllWidths).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('obtengo datos de cache de widths');
    });

    it('should fetch widths from repository and cache the result if no cached data', async () => {
      const cacheKey = 'all_widths';
      const widths = [200, 205];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(productTireRepository, 'findAllWidths').mockResolvedValue(widths);

      const response = await service.getAllWidthsByTires();

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(productTireRepository.findAllWidths).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, widths);
      expect(response).toEqual(new ResponseWidthDto(widths));
      expect(mockLogger.log).toHaveBeenCalledWith('no obtengo datos de cache de widths');
    });
  });

  describe('getProfilesByWidth', () => {
    it('should return cached profiles by width', async () => {
      const width = 200;
      const cacheKey = `profiles_width_${width}`;
      const cachedProfiles = [55, 60];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedProfiles);

      const response = await service.getProfilesByWidth(width);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(response).toEqual(new ResponseProfileDto(cachedProfiles));
      expect(productTireRepository.findProfilesByWidth).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(`obtengo datos de cache de profiles por width: ${width}`);
    });

    it('should fetch profiles from repository and cache the result if no cached data', async () => {
      const width = 200;
      const cacheKey = `profiles_width_${width}`;
      const profiles = [55, 60];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(productTireRepository, 'findProfilesByWidth').mockResolvedValue(profiles);

      const response = await service.getProfilesByWidth(width);

      expect(productTireRepository.findProfilesByWidth).toHaveBeenCalledWith(width);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, profiles);
      expect(response).toEqual(new ResponseProfileDto(profiles));
      expect(mockLogger.log).toHaveBeenCalledWith(`no obtengo datos de cache de profiles por width: ${width}`);
    });
  });

  describe('getRimsByWidthAndProfile', () => {
    it('should return cached rims by width and profile', async () => {
      const width = 200;
      const profile = 50;
      const cacheKey = `rims_width_${width}_profile_${profile}`;
      const cachedRims = [18, 19];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedRims);

      const response = await service.getRimsByWidthAndProfile(width, profile);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(response).toEqual(new ResponseRimDto(cachedRims));
      expect(productTireRepository.findRimsByWidthAndProfile).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        `obtengo datos de cache de rims por width: ${width} y profile: ${profile}`,
      );
    });

    it('should fetch rims from repository and cache the result if no cached data', async () => {
      const width = 200;
      const profile = 50;
      const cacheKey = `rims_width_${width}_profile_${profile}`;
      const rims = [18, 19];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(productTireRepository, 'findRimsByWidthAndProfile').mockResolvedValue(rims);

      const response = await service.getRimsByWidthAndProfile(width, profile);

      expect(productTireRepository.findRimsByWidthAndProfile).toHaveBeenCalledWith(width, profile);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, rims);
      expect(response).toEqual(new ResponseRimDto(rims));
      expect(mockLogger.log).toHaveBeenCalledWith(
        `no obtengo datos de cache de rims por width: ${width} y profile: ${profile}`,
      );
    });
  });

  describe('getTiresByMeasure', () => {
    it('should call getTiresByMeasures and return PlpTiresResponseDto', async () => {
      const width = 200;
      const profile = 50;
      const rim = 18;
      const storeId = 'store-1';
      const channel = AppDomain.Channels.STORE;
      const tiresMockData = [];

      jest.spyOn(productRepository, 'getTiresByMeasures').mockResolvedValue(tiresMockData);

      const response = await service.getTiresByMeasure(width, profile, rim, storeId, channel);

      expect(productRepository.getTiresByMeasures).toHaveBeenCalledWith(width, profile, rim, storeId);
      expect(response.tires).toEqual([]);
    });
  });

  describe('getMeasures', () => {
    it('should call wheelSizeService.getMeasures and return the correct measures', async () => {
      const brand = 'porsche';
      const model = 'cayenne';
      const year = '2023';
      const modification = '51b4b5e996';
      const mockWheels = {
        is_stock: true,
        showing_fp_only: false,
        front: { tire_width_mm: 200, tire_aspect_ratio: 55, rim_diameter: 18 },
        rear: { tire_width_mm: 205, tire_aspect_ratio: 60, rim_diameter: 19 },
      };
      const mockMeasures = [
        {
          wheels: [mockWheels],
        },
      ];

      jest.spyOn(wheelSizeService, 'getMeasures').mockResolvedValue(mockMeasures);

      const result = await service.getMeasures(brand, model, year, modification);
      expect(wheelSizeService.getMeasures).toHaveBeenCalledWith(brand, model, year, modification);
      expect(result).toEqual([new MeasuresByWheelsizeDto(mockWheels)]);
    });
  });

  describe('getTiresDouble', () => {
    it('should call getTiresDouble and return SuccessResponseDto', async () => {
      const query = {
        frontWidth: 285,
        frontProfile: 40,
        frontRim: 21,
        rearWidth: 315,
        rearProfile: 35,
        rearRim: 21,
        storeId: '6075fa65-9dd1-464a-8314-26d926a0a964',
        channel: AppDomain.Channels.STORE,
      };

      const frontTires = [
        {
          id: '1',
          brand: {
            id: 'brand-id',
            name: 'Marca Ejemplo',
            description: 'Descripción de la marca',
            logo: 'url-de-logo',
            hasCorporateAgreement: false,
          },
          emotionalDescription: 'Descripción emocional',
          design: 'Diseño X',
          image: 'url-imagen-frente',
          imageFront: 'url-imagen-frente',
          imageSide: 'url-imagen-lado',
          imageDiagonal: 'url-imagen-diagonal',
          imageDetail: 'url-imagen-detalle',
          imageTread: 'url-imagen-surco',
          audio: 'url-audio',
          image360: 'url-imagen-360',
          tireConstruction: 'Construcción de neumático',
          width: 285,
          profile: 40,
          rim: 21,
          speedIndex: 'V',
          speedIndexEquivalence: '120',
          loadIndex: '100',
          loadIndexEquivalence: '110',
          utqgScore: '700',
          percentageOnRoad: 70,
          percentageOffRoad: 30,
          terrainType: '70% en carretera / 30% fuera de carretera',
          useCar: true,
          useSuv: false,
          useSport: false,
          usePickup: false,
          useCommercial: false,
          highwayCompatible: true,
          reinforced: true,
          runFlat: false,
          price: 100,
          priceInCombo: 90,
          warrantyLeon: true,
          stockAvailable: 10,
          createdAt: new Date(),
        },
      ];

      const rearTires = [];
      const result = {
        comboItems: { rear: [], front: [] },
        tires: [
          {
            front: frontTires[0],
            rear: null,
          },
        ],
      };

      jest
        .spyOn(service, 'getTiresByMeasure')
        .mockResolvedValueOnce({ tires: rearTires, comboItems: [] })
        .mockResolvedValueOnce({ tires: frontTires, comboItems: [] });

      const response = await service.getTiresDouble(query);

      expect(service.getTiresByMeasure).toHaveBeenCalledWith(
        query.rearWidth,
        query.rearProfile,
        query.rearRim,
        query.storeId,
        query.channel,
      );
      expect(service.getTiresByMeasure).toHaveBeenCalledWith(
        query.frontWidth,
        query.frontProfile,
        query.frontRim,
        query.storeId,
        query.channel,
      );
      expect(response).toEqual(result);
    });
  });
});
