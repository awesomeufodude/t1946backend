import { Test, TestingModule } from '@nestjs/testing';
import { CompanyBusinessService } from './company-business.service';
import { CompanyBusinessRepository } from 'src/infrastructure/database/repositories/company-business.repository';
import { Logger } from '@nestjs/common';
import { CompanyBusinessDto } from './company-business.dto';

describe('CompanyBusinessService', () => {
  let service: CompanyBusinessService;
  let repository: CompanyBusinessRepository;

  const mockCompanyBusinessRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBusinessService,
        {
          provide: CompanyBusinessRepository,
          useValue: mockCompanyBusinessRepository,
        },
        Logger,
      ],
    }).compile();

    service = module.get<CompanyBusinessService>(CompanyBusinessService);
    repository = module.get<CompanyBusinessRepository>(CompanyBusinessRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of CompanyBusinessDto', async () => {
    const result = [
      {
        id: 1,
        company_business: 'Agricultura, ganadería, silvicultura y pesca',
        createdAt: new Date(),
        updatedAt: new Date(),
        customersCompany: [],
      },
    ];
    jest.spyOn(repository, 'findAll').mockResolvedValue(result);

    const response = await service.getCompanyBusinesses();

    expect(response).toBeInstanceOf(Array);
    expect(response.length).toBe(1);
    expect(response[0]).toBeInstanceOf(CompanyBusinessDto);
    expect(response[0].id).toEqual(1);
  });

  it('should log the getCompanyBusinesses method', async () => {
    const loggerSpy = jest.spyOn(service['logger'], 'log');
    await service.getCompanyBusinesses();
    expect(loggerSpy).toHaveBeenCalledWith('getCompanyBusinesses');
  });

  it('should handle empty array response', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([]);
    const response = await service.getCompanyBusinesses();
    expect(response).toEqual([]);
  });
});
