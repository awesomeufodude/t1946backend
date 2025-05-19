import { Test, TestingModule } from '@nestjs/testing';
import { TiresController } from './tires.controller';
import { TiresService } from './tires.service';
import { Logger } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

describe('TiresController', () => {
  let controller: TiresController;
  let tiresService: TiresService;
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const mockTiresService = {
      getAllWidthsByTires: jest.fn().mockResolvedValue([]),
      getProfilesByWidth: jest.fn().mockResolvedValue([]),
      getRimsByWidthAndProfile: jest.fn().mockResolvedValue([]),
      getTiresByMeasure: jest.fn().mockResolvedValue([]),
      getTireBySku: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiresController],
      providers: [
        { provide: Logger, useValue: mockLogger },
        { provide: TiresService, useValue: mockTiresService },
      ],
    }).compile();

    controller = module.get<TiresController>(TiresController);
    tiresService = module.get<TiresService>(TiresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAllWidthsByTires and return SuccessResponseDto', async () => {
    const result = new SuccessResponseDto([]);
    jest.spyOn(tiresService, 'getAllWidthsByTires').mockResolvedValue([]);

    const response = await controller.getAllwidthByTires();
    expect(tiresService.getAllWidthsByTires).toHaveBeenCalled();
    expect(response).toEqual(result);
  });

  it('should call getProfilesByWidth and return SuccessResponseDto', async () => {
    const width = 200;
    const result = new SuccessResponseDto([]);
    jest.spyOn(tiresService, 'getProfilesByWidth').mockResolvedValue([]);

    const response = await controller.getProfilesByWidth(width);
    expect(tiresService.getProfilesByWidth).toHaveBeenCalledWith(width);
    expect(response).toEqual(result);
  });

  it('should call getRimsByWidthAndProfile and return SuccessResponseDto', async () => {
    const width = 200;
    const profile = 50;
    const result = new SuccessResponseDto([]);
    jest.spyOn(tiresService, 'getRimsByWidthAndProfile').mockResolvedValue([]);

    const response = await controller.getRimsByWidthAndProfile(width, profile);
    expect(tiresService.getRimsByWidthAndProfile).toHaveBeenCalledWith(width, profile);
    expect(response).toEqual(result);
  });

  it('should call getTireBySku and return SuccessResponseDto', async () => {
    const sku = '123456';
    const query = { storeId: '1', channel: 'online' };
    const result = new SuccessResponseDto(null);
    jest.spyOn(tiresService, 'getTireBySku').mockResolvedValue(null);

    const response = await controller.getTireBySku(sku, query.storeId, query.channel);
    expect(tiresService.getTireBySku).toHaveBeenCalledWith(sku, query.storeId, query.channel);
    expect(response).toEqual(result);
  });
});
