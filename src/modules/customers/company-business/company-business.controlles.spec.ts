import { Test, TestingModule } from '@nestjs/testing';
import { CompanyBusinessController } from './company-business.controller';
import { CompanyBusinessService } from './company-business.service';
import { Logger } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

describe('CompanyBusinessController', () => {
  let controller: CompanyBusinessController;
  let service: CompanyBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyBusinessController],
      providers: [
        {
          provide: CompanyBusinessService,
          useValue: {
            getCompanyBusinesses: jest.fn().mockResolvedValue([{ id: '1', name: 'Business 1' }]),
          },
        },
        Logger,
      ],
    }).compile();

    controller = module.get<CompanyBusinessController>(CompanyBusinessController);
    service = module.get<CompanyBusinessService>(CompanyBusinessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return company businesses', async () => {
    const result = [{ id: '1', name: 'Business 1' }];
    jest.spyOn(service, 'getCompanyBusinesses').mockResolvedValue(result);

    const response = await controller.getCompanyBusinesses();

    expect(response).toBeInstanceOf(SuccessResponseDto);
    expect(response.data).toEqual(result);
  });
});
