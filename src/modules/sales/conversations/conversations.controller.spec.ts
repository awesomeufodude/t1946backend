import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetGroup } from 'src/infrastructure/database/entities/budget-group.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { UsersService } from 'src/modules/admin/users/users.service';
import { createMockUser } from 'src/modules/admin/users/users.service.spec';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { BudgetsService } from '../budgets/budgets.service';
import { createMockCatalogVehicle } from '../budgets/budgets.service.spec';
import { ConversationsController } from './conversations.controller';
import { GetConversationsDto, PostConversationDto } from './conversations.dto';
import { ResponseConversationDto } from './response-conversation.dto';

function createExpectedConversation() {
  return expect.objectContaining({
    id: expect.any(Number),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    expiresAt: expect.any(Date),
    extended: expect.any(Boolean),
    createdBy: expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      lastname: expect.any(String),
      rut: expect.any(String),
    }),
  });
}

function createMockVehicle(): Vehicle {
  const vehicle = new Vehicle();

  vehicle.id = faker.string.uuid();
  vehicle.plate = faker.vehicle.vrm();
  vehicle.color = faker.vehicle.color();
  vehicle.vehicleCatalog = createMockCatalogVehicle();

  return vehicle;
}

export function createMockResponseConversation(user: User): ResponseConversationDto {
  const budgetGroup = new BudgetGroup();
  budgetGroup.createdBy = user;
  budgetGroup.vehicle = createMockVehicle();

  const responseDto = new ResponseConversationDto(budgetGroup);

  responseDto.id = faker.number.int();
  responseDto.createdAt = faker.date.past();
  responseDto.updatedAt = faker.date.recent();
  responseDto.expiresAt = faker.date.soon();
  responseDto.extended = faker.datatype.boolean();

  return responseDto;
}

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let budgetService: jest.Mocked<BudgetsService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: BudgetsService,
          useValue: {
            findByUserAndDate: jest.fn(),
            getConversationsByUser: jest.fn(),
            createConversation: jest.fn(),
            findConversationById: jest.fn(),
            deleteConversation: jest.fn(),
            extendConversation: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    budgetService = module.get<BudgetsService, jest.Mocked<BudgetsService>>(BudgetsService);
    logger = module.get<Logger, jest.Mocked<Logger>>(Logger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllConversationsByUserAndDate', () => {
    it('should call the service and return a success response', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };
      const mockQuery: GetConversationsDto = {
        date: '2024-09-30',
        storeId: faker.string.uuid(),
      };

      const user = createMockUser();
      budgetService.getConversationsByUser.mockResolvedValue([createMockResponseConversation(user)]);

      const result = await controller.getAllConversationsByUserAndDate(mockRequest, mockQuery);

      expect(logger.log).toHaveBeenCalledWith('getAllConversationsByUserAndDate');
      expect(budgetService.getConversationsByUser).toHaveBeenCalledWith('user-123', '2024-09-30', mockQuery.storeId);
      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data).toEqual(expect.arrayContaining([createExpectedConversation()]));
    });

    it('should use the current date if no date is provided in the query', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };
      const mockQuery: GetConversationsDto = {
        storeId: faker.string.uuid(),
      };

      const currentDate = new Date().toISOString().split('T')[0];
      const user = createMockUser();
      budgetService.getConversationsByUser.mockResolvedValue([createMockResponseConversation(user)]);

      const result = await controller.getAllConversationsByUserAndDate(mockRequest, mockQuery);

      expect(logger.log).toHaveBeenCalledWith('getAllConversationsByUserAndDate');
      expect(budgetService.getConversationsByUser).toHaveBeenCalledWith('user-123', currentDate, mockQuery.storeId);
      expect(result).toBeInstanceOf(SuccessResponseDto);
      expect(result.data).toEqual(expect.arrayContaining([createExpectedConversation()]));
    });
  });

  describe('createConversation', () => {
    it('should call the service and return a success response', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };
      const mockBody: PostConversationDto = {
        channel: 'STORE',
        storeId: faker.string.uuid(),
        customerId: null,
        vehicleId: null,
        leadId: null,
        consultationChannelId: null,
        budget: {
          items: [],
        },
        searchByVehicle: false,
        doublePlp: false,
        measureDouble: {
          front: {
            width: 205,
            profile: 55,
            rim: 16,
          },
          rear: {
            width: 205,
            profile: 55,
            rim: 16,
          },
        },
      };

      const result = await controller.createConversation(mockRequest, mockBody);

      expect(logger.log).toHaveBeenCalledWith('createConversation');
      expect(budgetService.createConversation).toHaveBeenCalledWith('user-123', mockBody);
      expect(result).toBeInstanceOf(SuccessResponseDto);
    });
  });

  describe('getConversationById', () => {
    it('should call the service and return a success response', async () => {
      const mockRequest = {
        user: { sub: 'user-123', role: 'user-role' },
      };
      const mockParams = 123;
      const mockQuery = { store: faker.string.uuid() };
      const user = createMockUser();
      budgetService.findConversationById.mockResolvedValue(createMockResponseConversation(user));

      const result = await controller.getConversationById(mockRequest, mockParams, mockQuery);

      expect(logger.log).toHaveBeenCalledWith(`getConversationById ${JSON.stringify(mockQuery, null, 2)}`);
      expect(budgetService.findConversationById).toHaveBeenCalledWith('user-123', 123, mockQuery.store, 'user-role');
      expect(result).toBeInstanceOf(SuccessResponseDto);
    });
  });

  describe('deleteConversation', () => {
    it('should call the service and return a success response', async () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
        },
      };
      const mockParams = 123;
      const result = await controller.deleteConversation(mockRequest, mockParams);

      budgetService.deleteConversation.mockResolvedValue();

      expect(logger.log).toHaveBeenCalledWith('deleteConversation');
      expect(budgetService.deleteConversation).toHaveBeenCalledWith(mockRequest.user.sub, mockParams);
      expect(result).toBeInstanceOf(SuccessResponseDto);
    });

    it('should throw an error if the conversation does not exist', async () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
        },
      };
      const mockParams = 123;

      budgetService.deleteConversation.mockRejectedValue(new Error('Conversation not found'));

      await expect(controller.deleteConversation(mockRequest, mockParams)).rejects.toThrow('Conversation not found');
    });
  });

  describe('extendConversation', () => {
    it('should call the service and return a success response', async () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
        },
      };
      const mockParams = 123;
      const mockBody = {
        extended: true,
      };

      const user = createMockUser();
      budgetService.extendConversation.mockResolvedValue(createMockResponseConversation(user));

      const result = await controller.extendConversation(mockRequest, mockParams, mockBody);

      expect(logger.log).toHaveBeenCalledWith('extendConversation');
      expect(budgetService.extendConversation).toHaveBeenCalledWith('user-123', 123, true);
      expect(result).toBeInstanceOf(SuccessResponseDto);
    });

    it('should throw an error if the conversation does not exist', async () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
        },
      };
      const mockParams = 123;
      const mockBody = {
        extended: true,
      };

      budgetService.extendConversation.mockRejectedValue(new Error('Conversation not found'));

      await expect(controller.extendConversation(mockRequest, mockParams, mockBody)).rejects.toThrow(
        'Conversation not found',
      );
    });
  });
});
