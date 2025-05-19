import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from 'src/infrastructure/database/entities/appointment-status.entity';
import { Appointment, AppointmentMode } from 'src/infrastructure/database/entities/appointment.entity';
import { BudgetStatus } from 'src/infrastructure/database/entities/budget-status.entity';
import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { AppointmentRepository } from 'src/infrastructure/database/repositories/appointment.repository';
import { createMockUser } from 'src/modules/admin/users/users.service.spec';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { AppointmentsService } from '../appointments/appointments.service';
import { BudgetsService } from '../budgets/budgets.service';
import { createMockConversation } from '../budgets/budgets.service.spec';
import { ResponseAppointmentDto } from './appointments.dto';
export const mockStatus: AppointmentStatus = {
  code: SalesDomain.APPOINTMENT_STATUS.EXPIRED,
  description: 'EXPIRED',
  appointments: [],
};
export const mockBudgetStatus: BudgetStatus = {
  code: 'SENT',
  description: 'Enviado',
  budgets: [],
};
export const mockBudget: Budget = {
  id: faker.string.uuid(),
  appointments: [],
  budgetGroup: createMockConversation(createMockUser()),
  status: mockBudgetStatus,
  createdAt: new Date(),
  updatedAt: new Date(),
  total: 20000,
  subTotal: 20000,
  iva: 0,
  sent: 0,
  sentAt: new Date(),
  workorder: null,
  budgetItems: [],
  notes: [],
  searchHistories: [],
};
export const mockAppointment: Appointment = {
  id: faker.string.uuid(),
  mode: AppointmentMode.LEAVE,
  appointmentDate: new Date(),
  budget: mockBudget,
  needDeliveryReturn: false,
  hasDifferentLocationDelivery: false,
  pickupAddress: null,
  pickupAddressNumber: null,
  pickupAddressComment: null,
  pickupAddressLatitude: null,
  pickupAddressLongitude: null,
  deliveryAddress: null,
  deliveryAddressNumber: null,
  deliveryAddressComment: null,
  deliveryAddressLatitude: null,
  deliveryAddressLongitude: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: mockStatus,
};
describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repository: AppointmentRepository;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: AppointmentRepository,
          useValue: {
            findByUserStoreAndDate: jest.fn(),
            changeStatus: jest.fn(),
            createAppointment: jest.fn(),
            findById: jest.fn(),
            updateAppointment: jest.fn(),
          },
        },
        {
          provide: AppointmentTimeslotRepository,
          useValue: {
            updateSlotUsed: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: BudgetsService,
          useValue: {
            transformAppointementToBudget: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<AppointmentsService>(AppointmentsService);
    repository = module.get<AppointmentRepository>(AppointmentRepository);
    logger = module.get<Logger>(Logger);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findByUserStoreAndDate', () => {
    it('should call findByUserStoreAndDate with correct parameters and return transformed result', async () => {
      const userId = 'user1';
      const storeId = 'store1';
      const date = '2023-10-01';
      const mockFormattedDate = new Date(date + 'T00:00:00');
      jest.spyOn(repository, 'findByUserStoreAndDate').mockResolvedValue([mockAppointment]);
      const result = await service.findByUserStoreAndDate(userId, storeId, date);
      expect(logger.log).toHaveBeenCalledWith('findByUserStoreAndDate');
      expect(repository.findByUserStoreAndDate).toHaveBeenCalledWith(userId, storeId, mockFormattedDate);
      expect(result).toEqual([mockAppointment].map((appointment) => new ResponseAppointmentDto(appointment)));
    });
    it('should call changeStatus with correct parameters', async () => {
      const appointmentId = mockAppointment.id;
      const statusCode = 'status1';
      jest.spyOn(repository, 'changeStatus').mockResolvedValue(mockAppointment);
      await service.changeStatus(appointmentId, statusCode);
      expect(logger.log).toHaveBeenCalledWith('changeStatus');
      expect(repository.changeStatus).toHaveBeenCalledWith(appointmentId, statusCode);
    });
    it('should handle empty results correctly', async () => {
      const userId = 'user1';
      const storeId = 'store1';
      const date = '2023-10-01';
      const mockFormattedDate = new Date(date + 'T00:00:00');
      jest.spyOn(repository, 'findByUserStoreAndDate').mockResolvedValue([]);
      const result = await service.findByUserStoreAndDate(userId, storeId, date);
      expect(logger.log).toHaveBeenCalledWith('findByUserStoreAndDate');
      expect(repository.findByUserStoreAndDate).toHaveBeenCalledWith(userId, storeId, mockFormattedDate);
      expect(result).toEqual([]);
    });
  });
  describe('createAppointment', () => {
    it('should call createAppointment with correct parameters and return transformed result', async () => {
      const userId = 'user1';
      const appointmentData = {
        budgetId: mockBudget.id,
        date: '2023-10-01',
        time: '10:00',
        mode: AppointmentMode.LEAVE,
        locationPickup: null,
        needDeliveryReturn: false,
        hasDifferentLocationDelivery: false,
        locationDelivery: null,
      };
      const mockAppointmentData = {
        budget: { id: mockBudget.id },
        mode: AppointmentMode.LEAVE,
        appointmentDate: new Date('2023-10-01T10:00:00'),
        needDeliveryReturn: false,
        hasDifferentLocationDelivery: false,
        pickupAddress: null,
        pickupAddressNumber: null,
        pickupAddressComment: null,
        pickupAddressLatitude: null,
        pickupAddressLongitude: null,
        deliveryAddress: null,
        deliveryAddressNumber: null,
        deliveryAddressComment: null,
        deliveryAddressLatitude: null,
        deliveryAddressLongitude: null,
        status: { code: SalesDomain.APPOINTMENT_STATUS.SCHEDULED },
      };
      jest.spyOn(repository, 'createAppointment').mockResolvedValue(mockAppointment);
      const result = await service.createAppointment(appointmentData, userId);
      expect(repository.createAppointment).toHaveBeenCalledWith(mockAppointmentData);
      expect(result).toEqual(new ResponseAppointmentDto(mockAppointment));
    });
  });
  describe('getAppointment', () => {
    it('should call findById with correct parameters and return transformed result', async () => {
      const appointmentId = mockAppointment.id;
      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      const result = await service.findById(appointmentId);
      expect(logger.log).toHaveBeenCalledWith('findById');
      expect(repository.findById).toHaveBeenCalledWith(appointmentId);
      expect(result).toEqual(new ResponseAppointmentDto(mockAppointment));
    });
    it('should return error if appointment is not found', async () => {
      const appointmentId = 'id1';
      jest.spyOn(repository, 'findById').mockRejectedValue(new Error('Appointment not found'));
      try {
        await service.findById(appointmentId);
      } catch (error) {
        expect(error.message).toBe('Appointment not found');
      }
    });
  });
  describe('updateAppointmentStatus', () => {
    it('should call changeStatus with correct parameters and return transformed result', async () => {
      const appointmentId = mockAppointment.id;
      const statusCode = 'status1';
      jest.spyOn(repository, 'changeStatus').mockResolvedValue(mockAppointment);
      const result = await service.changeStatus(appointmentId, statusCode);
      expect(logger.log).toHaveBeenCalledWith('changeStatus');
      expect(repository.changeStatus).toHaveBeenCalledWith(appointmentId, statusCode);
      expect(result).toEqual(new ResponseAppointmentDto(mockAppointment));
    });
    it('should return error if appointment is not found', async () => {
      const appointmentId = 'id1';
      const statusCode = 'status1';
      jest.spyOn(repository, 'changeStatus').mockRejectedValue(new Error('Appointment not found'));
      try {
        await service.changeStatus(appointmentId, statusCode);
      } catch (error) {
        expect(error.message).toBe('Appointment not found');
      }
    });
  });
  describe('changeAppointment', () => {
    it('should call updateAppointment with correct parameters and return transformed result', async () => {
      const appointmentId = mockAppointment.id;
      const appointmentData = {
        budgetId: mockBudget.id,
        date: '2023-10-01',
        time: '10:00',
        mode: AppointmentMode.LEAVE,
        locationPickup: null,
        needDeliveryReturn: false,
        hasDifferentLocationDelivery: false,
        locationDelivery: null,
      };
      const mockAppointmentData = {
        budget: { id: mockBudget.id },
        mode: AppointmentMode.LEAVE,
        appointmentDate: new Date('2023-10-01T10:00:00'),
        needDeliveryReturn: false,
        hasDifferentLocationDelivery: false,
        pickupAddress: null,
        pickupAddressNumber: null,
        pickupAddressComment: null,
        pickupAddressLatitude: null,
        pickupAddressLongitude: null,
        deliveryAddress: null,
        deliveryAddressNumber: null,
        deliveryAddressComment: null,
        deliveryAddressLatitude: null,
        deliveryAddressLongitude: null,
        status: { code: SalesDomain.APPOINTMENT_STATUS.RESCHEDULED },
      };
      jest.spyOn(repository, 'findById').mockResolvedValue(mockAppointment);
      jest.spyOn(repository, 'updateAppointment').mockResolvedValue(mockAppointment);
      const result = await service.updateAppointment(appointmentId, appointmentData);
      expect(repository.updateAppointment).toHaveBeenCalledWith(appointmentId, mockAppointmentData);
      expect(result).toEqual(new ResponseAppointmentDto(mockAppointment));
    });
    it('should return error if appointment is not found', async () => {
      const appointmentId = 'id1';
      const appointmentData = {
        budgetId: mockBudget.id,
        date: '2023-10-01',
        time: '10:00',
        mode: AppointmentMode.LEAVE,
        locationPickup: null,
        needDeliveryReturn: false,
        hasDifferentLocationDelivery: false,
        locationDelivery: null,
      };
      jest.spyOn(repository, 'updateAppointment').mockRejectedValue(new Error('Appointment not found'));
      try {
        await service.updateAppointment(appointmentId, appointmentData);
      } catch (error) {
        expect(error.message).toBe('Appointment not found');
      }
    });
  });
});
