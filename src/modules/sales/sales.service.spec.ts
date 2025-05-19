import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { BussinessLineRepository } from 'src/infrastructure/database/repositories/bussiness-line.repository';
import { NotFoundException, Logger } from '@nestjs/common';
import { ROUTES, TYPE_SALES } from '../common/constants';
import { appConstants } from 'src/config/app.constants';
import { UsersService } from '../admin/users/users.service';
import { WorkordersService } from './workorders/workorders.service';
import { AppointmentsService } from './appointments/appointments.service';
import { BudgetsService } from './budgets/budgets.service';
import { SalesDto } from './sales.dto';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { createMockUser } from '../admin/users/users.service.spec';
import { createMockBudgetGroup, createMockWorkorder } from './workorders/workorders.service.spec';
import { createMockConversation } from './budgets/budgets.service.spec';

describe('SalesService', () => {
  let salesService: SalesService;
  let bussinessLineRepository: BussinessLineRepository;
  let usersService: UsersService;
  let budgetGroupRepository: BudgetGroupRepository;
  let workordersRepository: WorkorderRepository;

  const mockBussinessLineRepository = {
    findAllActive: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: BussinessLineRepository,
          useValue: mockBussinessLineRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WorkordersService,
          useValue: {
            findByUserAndDate: jest.fn(),
          },
        },
        {
          provide: AppointmentsService,
          useValue: {
            findByUserStoreAndDate: jest.fn(),
          },
        },
        {
          provide: BudgetsService,
          useValue: {
            getConversationsByUser: jest.fn(),
          },
        },
        {
          provide: WorkorderRepository,
          useValue: {
            findWorkOrderWithSecurityReviewByStore: jest.fn(),
            totalRecordsWorkorderByStore: jest.fn(),
          },
        },
        {
          provide: BudgetGroupRepository,
          useValue: {
            findConversationWithSecurityReviewByStore: jest.fn(),
            findBudgetWithSecurityReviewByStore: jest.fn(),
            totalRecordsConversation: jest.fn(),
            totalRecordsBudget: jest.fn(),
          },
        },
      ],
    }).compile();

    salesService = module.get<SalesService>(SalesService);
    bussinessLineRepository = module.get<BussinessLineRepository>(BussinessLineRepository);
    usersService = module.get<UsersService>(UsersService);
    budgetGroupRepository = module.get<BudgetGroupRepository>(BudgetGroupRepository);
    workordersRepository = module.get<WorkorderRepository>(WorkorderRepository);
  });

  it('should be defined', () => {
    expect(salesService).toBeDefined();
  });

  describe('getMenu', () => {
    it('should return business lines when they exist', async () => {
      const baseUrl = `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.SALES_MENU_PATH}/`;

      const mockBusinessLines = [
        {
          name: 'Neumáticos',
          description: 'Neumáticos para todo tipo de vehículos',
          image: baseUrl + 'tires.png',
          url: ROUTES.SALE.TIRES_SEARCH_BY_MEASURE,
          order: 1,
          code: 'TIRES',
        },
        {
          name: 'Baterías',
          description: 'Baterías de alto rendimiento para vehículos',
          image: baseUrl + 'batteries.png',
          url: null,
          order: 2,
          code: 'BATTERY',
        },
      ];
      mockBussinessLineRepository.findAllActive.mockResolvedValue(mockBusinessLines);

      const result = await salesService.getMenu();

      expect(result).toEqual(mockBusinessLines);
      expect(bussinessLineRepository.findAllActive).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no business lines found', async () => {
      mockBussinessLineRepository.findAllActive.mockResolvedValue([]);

      await expect(salesService.getMenu()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllSalesWithSecurityReviewByUserAndDate', () => {
    it('should combine conversations, budgets and workorders with security review', async () => {
      const mockUser = createMockUser();
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      const mockWorkOrder = createMockWorkorder(mockUser);
      const mockConversation = createMockConversation(mockUser);
      const mockBudgetGroup = createMockBudgetGroup();
      const mockConversations = [mockConversation];
      const mockBudgets = [mockBudgetGroup];
      const mockWorkorders = [mockWorkOrder];

      jest
        .spyOn(budgetGroupRepository, 'findConversationWithSecurityReviewByStore')
        .mockResolvedValue(mockConversations);
      jest.spyOn(budgetGroupRepository, 'findBudgetWithSecurityReviewByStore').mockResolvedValue(mockBudgets);
      jest.spyOn(workordersRepository, 'findWorkOrderWithSecurityReviewByStore').mockResolvedValue(mockWorkorders);

      jest.spyOn(budgetGroupRepository, 'totalRecordsConversation').mockResolvedValue(1);
      jest.spyOn(budgetGroupRepository, 'totalRecordsBudget').mockResolvedValue(1);
      jest.spyOn(workordersRepository, 'totalRecordsWorkorderByStore').mockResolvedValue(1);

      const result = await salesService.findAllSalesWithSecurityReviewByUserAndDate('user-1', 'store-1');

      expect(result.registers).toHaveLength(3);
      result.registers.forEach((item) => {
        expect(item).toBeInstanceOf(SalesDto);
      });

      const types = result.registers.map((item) => item.type);

      expect(types).toContain(TYPE_SALES.CONVERSATION);
      expect(types).toContain(TYPE_SALES.BUDGET);
      expect(types).toContain(TYPE_SALES.WORKORDER);

      expect(types.filter((t) => t === TYPE_SALES.CONVERSATION)).toHaveLength(1);
      expect(types.filter((t) => t === TYPE_SALES.BUDGET)).toHaveLength(1);
      expect(types.filter((t) => t === TYPE_SALES.WORKORDER)).toHaveLength(1);

      expect(budgetGroupRepository.findConversationWithSecurityReviewByStore).toHaveBeenCalledWith('store-1', 4);
      expect(budgetGroupRepository.findBudgetWithSecurityReviewByStore).toHaveBeenCalledWith('store-1', 3);
      expect(workordersRepository.findWorkOrderWithSecurityReviewByStore).toHaveBeenCalledWith('store-1', 3);
    });
  });
});
