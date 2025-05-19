import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerCompany } from 'src/infrastructure/database/entities/customer-company.entity';
import { CompanyBusinessRepository } from 'src/infrastructure/database/repositories/company-business.repository';
import { CustomerCompanyRepository } from 'src/infrastructure/database/repositories/customer-company.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { CustomersDomain } from 'src/shared/domain/customers.domain';
import { CustomersService } from '../customers.service';
import { CustomerCompanyResponseDto } from './companies.dto';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let customerCompanyRepository: jest.Mocked<CustomerCompanyRepository>;
  let companyBusinessRepository: jest.Mocked<CompanyBusinessRepository>;
  let customersService: jest.Mocked<CustomersService>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CustomerCompanyRepository,
          useValue: { findOne: jest.fn(), saveCustomerCompany: jest.fn(), getCompanyByEmail: jest.fn() },
        },
        {
          provide: CompanyBusinessRepository,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: CustomersService,
          useValue: { validateUniqueRut: jest.fn(), createOrUpdateCustomerOptions: jest.fn() },
        },
        {
          provide: CustomerRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    customerCompanyRepository = module.get(CustomerCompanyRepository);
    companyBusinessRepository = module.get(CompanyBusinessRepository);
    customersService = module.get(CustomersService);
    customerRepository = module.get(CustomerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateCompany', () => {
    const mockBody = {
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

    const mockCustomerBusiness = {
      id: 1,
      company_business: 'Agricultura, ganadería, silvicultura y pesca',
      updatedAt: new Date(),
      createdAt: new Date(),
      customersCompany: [],
    };

    const mockCustomerCompany = new CustomerCompany();
    mockCustomerCompany.id = 1;
    mockCustomerCompany.rut = mockBody.rut;
    mockCustomerCompany.legalName = mockBody.legalName;
    mockCustomerCompany.companyBusiness = mockCustomerBusiness;
    mockCustomerCompany.businessActivity = mockBody.businessActivity;
    mockCustomerCompany.contactEmail = mockBody.contactEmail;
    mockCustomerCompany.phoneZone = mockBody.phoneZone;
    mockCustomerCompany.phoneNumber = mockBody.phoneNumber;
    mockCustomerCompany.address = mockBody.address;
    mockCustomerCompany.addressLatitude = mockBody.addressLatitude;
    mockCustomerCompany.addressLongitude = mockBody.addressLongitude;
    mockCustomerCompany.contactName = mockBody.contactName;
    mockCustomerCompany.contactPhoneZone = mockBody.contactPhoneZone;
    mockCustomerCompany.contactPhoneNumber = mockBody.contactPhoneNumber;
    mockCustomerCompany.customer = {
      id: 'abx323',
      customerType: CustomersDomain.CustomerType.COMPANY,
      createdAt: new Date(),
      updatedAt: new Date(),
      vehiclesCustomer: [],
      customerPeople: null,
      customerCompany: mockCustomerCompany,
      budgetGroups: [],
      workorders: [],
      customerOptions: null,
    };

    it('should create a new company if not found', async () => {
      customerCompanyRepository.findOne.mockResolvedValue(null);
      customersService.validateUniqueRut.mockResolvedValue(null);
      companyBusinessRepository.findOne.mockResolvedValue(mockCustomerBusiness);
      customerCompanyRepository.saveCustomerCompany.mockResolvedValue(mockCustomerCompany);
      customerRepository.create.mockResolvedValue(mockCustomerCompany.customer); // Se asigna correctamente

      const result = await service.createOrUpdateCompany(mockBody);
      expect(result).toHaveProperty('id');
    });

    it('should update an existing company', async () => {
      const existingCompany = new CustomerCompany();
      existingCompany.customer = { id: 'abc123' } as any;
      customerCompanyRepository.findOne.mockResolvedValue(existingCompany);
      customersService.validateUniqueRut.mockResolvedValue(null);
      companyBusinessRepository.findOne.mockResolvedValue(mockCustomerBusiness);
      customerCompanyRepository.saveCustomerCompany.mockResolvedValue(existingCompany);

      const result = await service.createOrUpdateCompany(mockBody);
      expect(result).toHaveProperty('id');
    });
  });

  describe('validateUniqueRut', () => {
    it('should return a customer company if found', async () => {
      const customerCompany = new CustomerCompany();
      customerCompanyRepository.findOne.mockResolvedValue(customerCompany);

      const result = await service.validateUniqueRut('19897995-2');
      expect(result).toBe(customerCompany);
    });

    it('should return null if no customer company is found', async () => {
      customerCompanyRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUniqueRut('19897995-2');
      expect(result).toBeNull();
    });
  });

  describe('getCompanyByRut', () => {
    it('should return company details if found', async () => {
      const mockCompany = new CustomerCompany();
      mockCompany.rut = '19897995-2';
      mockCompany.legalName = 'Empresa XYZ S.A.';

      customerCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.getCompanyByRut('19897995-2');
      expect(result).toBeInstanceOf(CustomerCompanyResponseDto);
      expect(result.rut).toBe('19897995-2');
    });

    it('should throw NotFoundException if company is not found', async () => {
      customerCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.getCompanyByRut('19897995-2')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      customerCompanyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getCompanyByRut('19897995-2')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
