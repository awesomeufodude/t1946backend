import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockCustomer, createMockVehicle } from '../sales/workorders/workorders.service.spec';
import { CustomersController } from './customers.controller';
import { CreateLeadDto } from './customers.dto';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomersService = {
    createLead: jest.fn(),
    getCustomerByIdAndType: jest.fn(),
    getCustomerVehicles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
        Logger,
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLead', () => {
    it('should call CustomersService.createLead with correct parameters', async () => {
      const email = 'test@example.com';
      const createLeadDto: CreateLeadDto = {
        name: 'John Doe',
        phone: '1234567890',
      };

      const mockResponse = {
        id: '1',
        name: 'John',
        lastname: 'Doe',
        secondLastname: 'Smith',
        phoneZone: 56,
        email: 'test@example.com',
        phoneNumber: 931355018,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'createLead').mockResolvedValue(mockResponse);

      const result = await controller.createLead(email, createLeadDto);

      expect(service.createLead).toHaveBeenCalledWith(email, createLeadDto);
      expect(result).toEqual({
        message: 'OK',
        data: mockResponse,
      });
    });
  });

  describe('getCustomerByIdAndType', () => {
    it('should call CustomersService.getCustomerByIdAndType with correct parameters', async () => {
      const mockResponse = createMockCustomer();

      const type = 'customer';
      const id = mockResponse.id;

      jest.spyOn(service, 'getCustomerByIdAndType').mockResolvedValue(mockResponse);

      const result = await controller.getCustomerByIdAndType(id, type);

      expect(service.getCustomerByIdAndType).toHaveBeenCalledWith(type, id);
      expect(result).toEqual({
        message: 'OK',
        data: mockResponse,
      });
    });
  });

  describe('getCustomerVehicles', () => {
    it('should call CustomersService.getCustomerVehicles with correct parameters', async () => {
      const mockResponse = createMockVehicle();

      const id = mockResponse.id;

      jest.spyOn(service, 'getCustomerVehicles').mockResolvedValue([mockResponse]);

      const result = await controller.getCustomerVehicles(id);

      expect(service.getCustomerVehicles).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        message: 'OK',
        data: [mockResponse],
      });
    });
  });
});
