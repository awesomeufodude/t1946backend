import { faker } from '@faker-js/faker';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPeople } from 'src/infrastructure/database/entities/customer-people.entity';
import { Lead } from 'src/infrastructure/database/entities/lead.entity';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { CustomerOptionRepository } from 'src/infrastructure/database/repositories/customer-option.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { CustomerPeopleRepository } from '../../infrastructure/database/repositories/customer-people.repository';
import { VehiclesService } from '../core/vehicles/vehicles.service';
import { createMockCustomer } from '../sales/workorders/workorders.service.spec';
import { CreateCustomerDto, CreateLeadDto } from './customers.dto';
import { CustomersService } from './customers.service';
import { CustomerCompanyRepository } from 'src/infrastructure/database/repositories/customer-company.repository';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerPeopleRepository: jest.Mocked<CustomerPeopleRepository>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let leadRepository: jest.Mocked<LeadRepository>;
  let logger: jest.Mocked<Logger>;

  const mockCustomerPeopleRepository = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findByDocument: jest.fn(),
    customerCategory: null,
    consultationChannel: null,
  };

  const mockLeadRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as jest.Mocked<Logger>;

  const mockCustomerRepository = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  const mockCustomerCompanyRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: CustomerPeopleRepository, useValue: mockCustomerPeopleRepository },
        { provide: LeadRepository, useValue: mockLeadRepository },
        { provide: Logger, useValue: mockLogger },
        { provide: CustomerRepository, useValue: mockCustomerRepository },
        { provide: BudgetGroupRepository, useValue: jest.fn() },
        { provide: VehiclesRepository, useValue: jest.fn() },
        { provide: VehiclesService, useValue: jest.fn() },
        { provide: CustomerOptionRepository, useValue: jest.fn() },
        { provide: CustomerCompanyRepository, useValue: mockCustomerCompanyRepository },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    customerPeopleRepository = module.get(CustomerPeopleRepository);
    customerRepository = module.get(CustomerRepository);
    leadRepository = module.get(LeadRepository);
    logger = module.get(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    const email = 'test@example.com';
    const createLeadDto: CreateLeadDto = {
      name: 'John',
      lastname: 'Doe',
      secondLastname: 'Smith',
      phoneZone: '56',
      phone: '931355018',
    };
    const createCustomerDto: CreateCustomerDto = {
      name: 'John',
      lastname: 'Doe',
      secondLastname: 'Smith',
      phoneZone: '56',
      phone: '931355018',
      document: '12.345.678-9',
      address: 'Mock Address',
      addressLongitude: 10.123,
      addressLatitude: -10.123,
    };
    it('should update existing CustomerPeople', async () => {
      const email = 'test@example.com';

      const mockCustomerPeople = {
        id: 1,
        email,
        name: 'OldName',
        lastname: 'OldLastname',
        secondLastname: 'OldSecondLastname',
        phoneZone: 123,
        phoneNumber: 4567890,
        address: 'Old Address',
        addressLatitude: 0.0,
        addressLongitude: 0.0,
        customer: createMockCustomer(),
        documentId: '12345678-9',
        documentType: 'RUT',
        customerCategory: null,
        consultationChannel: null,
        addressNumber: null,
        addresComment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCustomerPeople = {
        ...mockCustomerPeople,
        name: createCustomerDto.name,
        lastname: createCustomerDto.lastname,
        secondLastname: createCustomerDto.secondLastname,
        phoneZone: Number(createCustomerDto.phoneZone),
        phoneNumber: Number(createCustomerDto.phone),
        address: createCustomerDto.address,
        addressLatitude: createCustomerDto.addressLatitude,
        addressLongitude: createCustomerDto.addressLongitude,
      };

      customerPeopleRepository.findByEmail.mockResolvedValue(mockCustomerPeople);
      customerPeopleRepository.findByDocument.mockResolvedValue(mockCustomerPeople);
      customerPeopleRepository.save.mockResolvedValue(updatedCustomerPeople);

      const result = await service.createLead(email, createCustomerDto);
      expect(customerPeopleRepository.findByDocument).toHaveBeenCalledWith(createCustomerDto.document);
      expect(customerPeopleRepository.save).toHaveBeenCalledWith(expect.objectContaining(updatedCustomerPeople));
      console.log(result);
    });

    it('should update existing Lead', async () => {
      const mockLead: Lead = {
        id: '1',
        email,
        name: 'OldName',
        lastname: 'Doe',
        secondLastname: 'Smith',
        phoneZone: 123,
        phoneNumber: 4567890,
        consultationChannel: null,
        budgetGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedLead = { ...mockLead, name: createLeadDto.name };

      customerPeopleRepository.findByEmail.mockResolvedValue(null);
      leadRepository.findByEmail.mockResolvedValue(mockLead);
      leadRepository.save.mockResolvedValue(updatedLead);

      const result = await service.createLead(email, createLeadDto);

      expect(leadRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(leadRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: createLeadDto.name }));
      expect(result).toEqual(expect.objectContaining({ name: createLeadDto.name }));
    });

    it('should create a new Lead if no CustomerPeople or Lead exists', async () => {
      const newLead: Lead = {
        id: '3',
        email,
        name: createLeadDto.name,
        lastname: createLeadDto.lastname,
        secondLastname: createLeadDto.secondLastname,
        phoneZone: 56,
        phoneNumber: 931355018,
        consultationChannel: null,
        budgetGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      customerPeopleRepository.findByEmail.mockResolvedValue(null);
      leadRepository.findByEmail.mockResolvedValue(null);
      leadRepository.create.mockResolvedValue(newLead);
      leadRepository.save.mockResolvedValue(newLead);

      const result = await service.createLead(email, createLeadDto);

      expect(leadRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email }));
      expect(leadRepository.save).toHaveBeenCalledWith(newLead);
      expect(result).toEqual(expect.objectContaining({ name: createLeadDto.name }));
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const error = new Error('Test Error');
      customerPeopleRepository.findByDocument.mockRejectedValue(error);

      await expect(service.createLead(email, createCustomerDto)).rejects.toThrow(
        new InternalServerErrorException('Hubo un error al crear o actualizar el Lead/CustomerPeople'),
      );
      expect(logger.error).toHaveBeenCalledWith('Error al crear o actualizar Lead/CustomerPeople', error.stack);
    });
  });

  describe('getCustomerByEmail', () => {
    const email = 'test@example.com';

    it('should return CustomerPeople if found', async () => {
      const mockCustomerPeople: CustomerPeople = {
        id: 1,
        email,
        name: 'John',
        lastname: 'Doe',
        secondLastname: 'Smith',
        phoneZone: 56,
        phoneNumber: 931355018,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: null,
        documentType: 'ID',
        documentId: '123456789',
        customerCategory: null,
        consultationChannel: null,
        address: faker.location.streetAddress(true),
        addressLatitude: parseFloat(faker.location.latitude().toString()),
        addressLongitude: parseFloat(faker.location.longitude().toString()),
        addresComment: null,
        addressNumber: null,
      };

      customerPeopleRepository.findByEmail.mockResolvedValue(mockCustomerPeople);

      const result = await service.getCustomerByEmail(email);

      expect(customerPeopleRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expect.objectContaining({ name: mockCustomerPeople.name }));
    });

    it('should return Lead if no CustomerPeople found but Lead exists', async () => {
      const mockLead: Lead = {
        id: '1',
        email,
        name: 'John',
        lastname: 'Doe',
        secondLastname: 'Smith',
        phoneZone: 56,
        phoneNumber: 931355018,
        consultationChannel: null,
        budgetGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      customerPeopleRepository.findByEmail.mockResolvedValue(null);
      leadRepository.findByEmail.mockResolvedValue(mockLead);

      const result = await service.getCustomerByEmail(email);

      expect(leadRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expect.objectContaining({ name: mockLead.name }));
    });

    it('should return null if neither CustomerPeople nor Lead exists', async () => {
      customerPeopleRepository.findByEmail.mockResolvedValue(null);
      leadRepository.findByEmail.mockResolvedValue(null);

      const result = await service.getCustomerByEmail(email);

      expect(customerPeopleRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(leadRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const error = new Error('Test Error');
      customerPeopleRepository.findByEmail.mockRejectedValue(error);

      await expect(service.getCustomerByEmail(email)).rejects.toThrow(
        new InternalServerErrorException('Hubo un error al obtener el Lead/CustomerPeople'),
      );
      expect(logger.error).toHaveBeenCalledWith('Error al obtener Lead/CustomerPeople', error.stack);
    });
  });

  describe('getCustomerByIdAndType', () => {
    it('should return customer if type is customer', async () => {
      const mockCustomer = createMockCustomer();
      const type = 'customer';
      const id = mockCustomer.id;

      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.getCustomerByIdAndType(type, id);

      expect(customerRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expect.objectContaining({ id }));
    });

    it('should return lead if type is lead', async () => {
      const mockLead: Lead = {
        id: '1',
        email: 'test@test.com',
        name: 'John',
        lastname: 'Doe',
        secondLastname: 'Smith',
        phoneZone: 123,
        phoneNumber: 4567890,
        consultationChannel: null,
        budgetGroups: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const type = 'lead';

      leadRepository.findById.mockResolvedValue(mockLead);

      const result = await service.getCustomerByIdAndType(type, mockLead.id);

      expect(leadRepository.findById).toHaveBeenCalledWith(mockLead.id);
      expect(result).toEqual(expect.objectContaining({ id: mockLead.id }));
    });
  });

  describe('getCustomerVehicles', () => {
    it('should return empty vehiculos for a customer if wasnt a relation betweeen them', async () => {
      const mockCustomer = createMockCustomer();

      customerRepository.findById.mockResolvedValue({
        ...mockCustomer,
      });

      const result = await service.getCustomerVehicles(mockCustomer.id);

      expect(result).toEqual([]);
    });
  });
});
