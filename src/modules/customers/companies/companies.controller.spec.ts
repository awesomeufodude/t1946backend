import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Logger } from '@nestjs/common';
import { CreateOrUpdateCompanyDto } from './companies.dto';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [CompaniesService, { provide: Logger, useValue: { log: jest.fn() } }],
    })
      .overrideProvider(CompaniesService)
      .useValue({
        createOrUpdateCompany: jest.fn().mockResolvedValue({ message: 'Success' }),
      })
      .compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrUpdateCompany', () => {
    it('should call the service and return SuccessResponseDto', async () => {
      const dto: CreateOrUpdateCompanyDto = {
        rut: '19897995-2',
        legalName: 'Empresa XYZ S.A.',
        companyBusinessId: 1,
        contactEmail: 'contacto@empresa.xyz',
        phoneZone: 56,
        phoneNumber: 987654321,
        address: 'Av. Siempre Viva 123',
        addressLatitude: -33.456,
        addressLongitude: -70.654,
        contactName: 'Juan Pérez',
        contactPhoneZone: 56,
        contactPhoneNumber: 123456789,
        businessActivity: '123456',
      };
      const result = await controller.createOrUpdateCompany(dto);

      expect(service.createOrUpdateCompany).toHaveBeenCalledWith(dto);
      expect(result).toEqual(new SuccessResponseDto({ message: 'Success' }));
    });
  });
});
