import { BadRequestException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LaborTimeRepository } from 'src/infrastructure/database/repositories/labor-time.repository';
import { LaborTimesService } from './labor-times.service';

describe('LaborTimesService', () => {
  let service: LaborTimesService;
  let mockLogger: Partial<Logger>;
  let laborTimeRepository: LaborTimeRepository;

  beforeEach(async () => {
    const mockLaborTimeRepository = {
      findLaborTimeByStoreAndBusinessLine: jest.fn().mockResolvedValue({}),
    };

    mockLogger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaborTimesService,
        { provide: Logger, useValue: mockLogger },
        { provide: LaborTimeRepository, useValue: mockLaborTimeRepository },
      ],
    }).compile();

    service = module.get<LaborTimesService>(LaborTimesService);
    laborTimeRepository = module.get<LaborTimeRepository>(LaborTimeRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find labor time by store and business line', async () => {
    laborTimeRepository.findLaborTimeByStoreAndBusinessLine = jest.fn().mockResolvedValue({
      time: '10:00',
    });

    const storeId = '1';
    const businessLineId = '1';

    const result = await service.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId);

    expect(result).toEqual({
      time: '10:00',
      description: '10 horas',
    });
    expect(laborTimeRepository.findLaborTimeByStoreAndBusinessLine).toHaveBeenCalledWith(storeId, businessLineId);
  });

  it('should return not found when labor time is not found', async () => {
    const storeId = '1';
    const businessLineId = '1';

    laborTimeRepository.findLaborTimeByStoreAndBusinessLine = jest.fn().mockResolvedValue(null);
    await expect(service.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId)).rejects.toThrow(
      BadRequestException,
    );
  });
});
