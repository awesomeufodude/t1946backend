import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentMode } from 'src/infrastructure/database/entities/appointment.entity';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { BrandDto, ModelDto, VersionDto } from 'src/modules/core/vehicles/vehicles.dto';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { AppointmentsController } from './appointments.controller';
import { AppointmentBudgetDto, GetAppointmentsDto, ResponseAppointmentDto } from './appointments.dto';
import { AppointmentsService } from './appointments.service';
import { mockAppointment, mockBudget } from './appointments.service.spec';

const getMockResponseAppointment = (): ResponseAppointmentDto => {
  return {
    appointmentDate: faker.date.recent(),
    id: mockAppointment.id,
    mode: mockAppointment.mode,
    status: mockBudget.status?.code,
    budget: getMockResponseBudgetDto(),
    createdAt: mockAppointment.createdAt,
    updatedAt: mockAppointment.updatedAt,
  };
};

const getMockResponseBudgetDto = (): AppointmentBudgetDto => {
  return {
    id: mockBudget.id,
    status: mockBudget.status?.code,
    total: mockBudget.total,
    createdAt: mockBudget.createdAt,
    updatedAt: mockBudget.updatedAt,
    customer: {
      id: mockBudget.budgetGroup.customer?.id || '',
      name: mockBudget.budgetGroup.customer?.customerPeople?.name || '',
      lastname: mockBudget.budgetGroup.customer?.customerPeople?.lastname || '',
      email: mockBudget.budgetGroup.customer?.customerPeople?.email || '',
      phoneZone: mockBudget.budgetGroup.customer?.customerPeople?.phoneZone || 56,
      phoneNumber: mockBudget.budgetGroup.customer?.customerPeople?.phoneNumber || 987655432,
    },
    vehicle: {
      id: mockBudget.budgetGroup.vehicle.id,
      plate: mockBudget.budgetGroup.vehicle.plate,
      color: mockBudget.budgetGroup.vehicle.color,
      year: mockBudget.budgetGroup.vehicle?.vehicleCatalog.year,
      brand: mockBudget.budgetGroup.vehicle?.vehicleCatalog?.brand as BrandDto,
      model: mockBudget.budgetGroup.vehicle?.vehicleCatalog?.model as ModelDto,
      version: mockBudget.budgetGroup.vehicle?.vehicleCatalog?.version as VersionDto,
      catalogId: mockBudget.budgetGroup.vehicle?.vehicleCatalog?.id || '',
      imageBrand: '',
      imageModel: '',
    },
  };
};

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
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
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAppointment', () => {
    it('should return SuccessResponseDto with data from createAppointment', async () => {
      const req = { user: { sub: 'user1' } };
      const appointment = {
        budgetId: 'budget1',
        date: '2023-10-01',
        time: '10:00',
        mode: AppointmentMode.LEAVE,
        locationPickup: {
          address: 'address1',
          addressNumber: 'number1',
          addressComment: 'comment1',
          addressLatitude: 1,
          addressLongitude: 1,
        },
        needDeliveryReturn: true,
        hasDifferentLocationDelivery: true,
        locationDelivery: {
          address: 'address2',
          addressNumber: 'number2',
          addressComment: 'comment2',
          addressLatitude: 2,
          addressLongitude: 2,
        },
      };
      const mockData = getMockResponseAppointment();

      jest.spyOn(service, 'createAppointment').mockResolvedValue(mockData);

      const result = await controller.craeteAppointment(req, appointment);

      expect(logger.log).toHaveBeenCalledWith('createAppointment');
      expect(service.createAppointment).toHaveBeenCalledWith(appointment, req.user.sub);
      expect(result).toEqual(new SuccessResponseDto(mockData));
    });
  });

  describe('getAllAppointmentsByUserStoreAndDate', () => {
    it('should return SuccessResponseDto with data from findByUserStoreAndDate', async () => {
      const req = { user: { sub: 'user1' } };
      const query: GetAppointmentsDto = {
        storeId: 'store1',
        date: '2023-10-01',
      };
      const mockData = [getMockResponseAppointment()];

      jest.spyOn(service, 'findByUserStoreAndDate').mockResolvedValue(mockData);

      const result = await controller.getAllAppoitnmentsByUserStoreAndDate(req, query);

      expect(logger.log).toHaveBeenCalledWith('getAllConversationsByUserAndDate');
      expect(service.findByUserStoreAndDate).toHaveBeenCalledWith(
        req.user.sub,
        query.storeId,
        query.date || new Date().toISOString().split('T')[0],
      );
      expect(result).toEqual(new SuccessResponseDto(mockData));
    });

    it("should use today's date if date is not provided in query", async () => {
      const req = { user: { sub: 'user1' } };
      const query: GetAppointmentsDto = {
        storeId: 'store1',
        date: null,
      };
      const mockData = [getMockResponseAppointment()];
      const today = new Date().toISOString().split('T')[0];

      jest.spyOn(service, 'findByUserStoreAndDate').mockResolvedValue(mockData);

      const result = await controller.getAllAppoitnmentsByUserStoreAndDate(req, query);

      expect(logger.log).toHaveBeenCalledWith('getAllConversationsByUserAndDate');
      expect(service.findByUserStoreAndDate).toHaveBeenCalledWith(req.user.sub, query.storeId, today);
      expect(result).toEqual(new SuccessResponseDto(mockData));
    });
  });
});
