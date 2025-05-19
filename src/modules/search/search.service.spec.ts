import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
import { VehiclesService } from '../core/vehicles/vehicles.service';
import { CustomersService } from '../customers/customers.service';
import { createMockCustomer, createMockVehicle } from '../sales/workorders/workorders.service.spec';
import { ResponseSearchDto } from './search.dto';
import { SearchService } from './search.service';

const mockVehicleRepository = {
  search: jest.fn(),
};

const mockCustomersService = {
  filterCustomersWithInProgressWorkorders: jest.fn(),
  filterVehiclesWithInProgressWorkorders: jest.fn(),
  filterCompaniesWithInProgressWorkorders: jest.fn(),
};

const mockLeadRepository = {
  search: jest.fn(),
};

const mockCustomerRepository = {
  searchCustomer: jest.fn(),
  searchCompanies: jest.fn(),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        { provide: VehiclesRepository, useValue: mockVehicleRepository },
        { provide: LeadRepository, useValue: mockLeadRepository },
        { provide: CustomerRepository, useValue: mockCustomerRepository },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: VehiclesService, useValue: {} },
        { provide: WheelSizeService, useValue: {} },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a ResponseSearchDto with customers, vehicles, and leads', async () => {
    const mockCustomers = [
      {
        ...createMockCustomer(),
        customerPeople: {
          documentId: '123-456',
          email: 'prueba@mail.com',
          name: 'John',
          lastname: 'Doe',
          secondLastname: 'Smith',
        },
        workorders: [],
      },
    ];
    const mockVehicles = [
      {
        ...createMockVehicle(),
        workorders: [],
      },
    ];

    mockCustomerRepository.searchCustomer.mockResolvedValue(mockCustomers);
    mockCustomerRepository.searchCompanies.mockResolvedValue([]);
    mockVehicleRepository.search.mockResolvedValue(mockVehicles);
    mockLeadRepository.search.mockResolvedValue([]);
    mockCustomersService.filterCustomersWithInProgressWorkorders.mockReturnValue(mockCustomers);
    mockCustomersService.filterVehiclesWithInProgressWorkorders.mockReturnValue(mockVehicles);
    mockCustomersService.filterCompaniesWithInProgressWorkorders.mockReturnValue([]);

    const result = await service.searchCustomersAndVehicles('John');

    expect(result).toBeInstanceOf(ResponseSearchDto);
    expect(mockCustomerRepository.searchCustomer).toHaveBeenCalledTimes(1);
    expect(mockCustomerRepository.searchCompanies).toHaveBeenCalledTimes(1);
    expect(mockVehicleRepository.search).toHaveBeenCalledTimes(1);
  });

  it('should log the search term when searching for customers and vehicles', async () => {
    const logSpy = jest.spyOn(service['logger'], 'log');

    await service.searchCustomersAndVehicles('John');

    expect(logSpy).toHaveBeenCalledWith('searchCustomersAndVehicles', 'John');
  });
});
