import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LaborTime } from 'src/infrastructure/database/entities/labor-time.entity';
import { LaborTimeRepository } from 'src/infrastructure/database/repositories/labor-time.repository';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { LaborTimesController } from './labor-times.controller';
import { ResponseLaborTimeDto } from './labor-times.dto';
import { LaborTimesService } from './labor-times.service';

describe('LaborTimesController', () => {
  let controller: LaborTimesController;
  let mockLogger: Partial<Logger>;
  let laborTimesService: LaborTimesService;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
    };

    const mockLaborTimeRepository = {
      findLaborTimeByStoreAndBusinessLine: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaborTimesController],
      providers: [
        LaborTimesService,
        { provide: Logger, useValue: mockLogger },
        {
          provide: LaborTimeRepository,
          useValue: mockLaborTimeRepository,
        },
      ],
    }).compile();

    controller = module.get<LaborTimesController>(LaborTimesController);
    laborTimesService = module.get<LaborTimesService>(LaborTimesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find labor time by store and business line', async () => {
    const storeId = '1';
    const businessLineId = '1';

    const laborTimeMock = {
      time: '10:30',
    } as LaborTime;

    jest
      .spyOn(laborTimesService, 'findLaborTimeByStoreAndBusinessLine')
      .mockResolvedValue(new ResponseLaborTimeDto(laborTimeMock));

    const result = await controller.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId);

    expect(result).toEqual(
      new SuccessResponseDto({
        time: '10:30',
        description: '10 horas 30 minutos',
      }),
    );
  });

  it('should return not found when labor time is not found', async () => {
    const storeId = '1';
    const businessLineId = '2';

    await expect(controller.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId)).rejects.toThrow();
  });
});
