import { faker } from '@faker-js/faker';
import { Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BudgetGroup } from 'src/infrastructure/database/entities/budget-group.entity';
import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { CatalogVehicle } from 'src/infrastructure/database/entities/catalog-vehicle.entity';
import { Channel } from 'src/infrastructure/database/entities/channel.entity';
import { ConsultationChannel } from 'src/infrastructure/database/entities/consultation-channel.entity';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { WorkorderItem } from 'src/infrastructure/database/entities/workorder-items.entity';
import { WorkorderStatus } from 'src/infrastructure/database/entities/workorder-status.entity';
import { DeliveryModeType, Workorder } from 'src/infrastructure/database/entities/workorder.entity';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository';
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { ServiceRepository } from 'src/infrastructure/database/repositories/service.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { VehicleCustomerRepository } from 'src/infrastructure/database/repositories/vehicle-customer.repository';
import { WorkorderItemRecordRepository } from 'src/infrastructure/database/repositories/workorder-item-record.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { createMockUser } from 'src/modules/admin/users/users.service.spec';
import { mockStore } from 'src/modules/security/authentication/authentication.service.spec';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { BudgetsService } from '../budgets/budgets.service';
import { createMockProduct, createMockProductTire } from '../budgets/budgets.service.spec';
import { ResponseConversationDto } from '../conversations/response-conversation.dto';
import { ResponseWorkorderDto } from './response-workorder.dto';
import { WorkordersService } from './workorders.service';
import { AppDomain } from 'src/shared/domain/app.domain';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { ServiceItemsRepository } from 'src/infrastructure/database/repositories/service-items.repository';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { UpdateStatusDto } from './workorders.dto';
import { WorkorderServicesItems } from 'src/infrastructure/database/entities/workorder-services-items';
import { Service } from 'src/infrastructure/database/entities/service.entity';
import { CoreDtos } from 'src/shared/dtos/core.dto';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';

export function createMockWorkorder(user: User): Workorder {
  const workorder = new Workorder();

  workorder.id = faker.number.int();
  workorder.createdBy = user;
  workorder.channel = createMockChannel();
  workorder.store = null;
  workorder.customer = createMockCustomer();
  workorder.vehicle = createMockVehicle();
  workorder.budget = createMockBudget();
  workorder.consultationChannel = createMockConsultationChannel();
  workorder.odometer = faker.number.float({ min: 0, max: 300000 });
  workorder.subTotal = faker.number.float({ min: 100, max: 10000 });
  workorder.discount = faker.number.float({ min: 0, max: 1000 });
  workorder.iva = faker.number.float({ min: 0, max: 500 });
  workorder.total = workorder.subTotal - workorder.discount + workorder.iva;
  workorder.deliveryTime = faker.date.future();
  workorder.deliveryMode = faker.helpers.arrayElement(Object.values(DeliveryModeType));
  workorder.reassigned = faker.datatype.boolean();
  workorder.reassignedTo = user;
  workorder.status = createMockWorkorderStatus();
  workorder.createdAt = new Date('2024-08-22T08:58:37.387Z');
  workorder.updatedAt = faker.date.recent();
  workorder.workOrderItems = [
    {
      id: 123456,
      workorder,
      itemId: '123',
      itemComboId: null,
      itemType: SalesDomain.ItemType.PRODUCT,
      quantity: faker.number.int(),
      total: faker.number.int(),
      unitPrice: faker.number.int(),
      unitDiscountedPrice: faker.number.int(),
      discountApprovedBy: null,
      promotion_id: null,
      userAssigned: user,
      itemStatus: {
        code: 'IN_PROGRESS',
        description: 'En progreso',
      },
      businessLineId: 1,
      workorderItemRecords: [],
      workorderServicesItems: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  ];

  return workorder;
}

export function createMockService(): any {
  const service = new Service();
  service.code = faker.string.alphanumeric(10);
  service.description = faker.lorem.sentence();
  service.subcategoryId = faker.number.int();
  service.applyToCar = faker.datatype.boolean();
  service.price = faker.number.float({ min: 0, max: 1000 });
  service.explanationTitle = faker.lorem.sentence();
  service.explanationDescription = faker.lorem.paragraph();
  service.sortOrder = faker.number.int();

  return service;
}

export function createMockWorkorderItem(workOrder?: any): WorkorderItem {
  const workorderItem = new WorkorderItem();

  workorderItem.id = 123456;
  workorderItem.itemId = faker.string.uuid();
  workorderItem.itemComboId = null;
  workorderItem.itemType = SalesDomain.ItemType.PRODUCT;
  workorderItem.quantity = faker.number.int();
  workorderItem.total = faker.number.int();
  workorderItem.unitPrice = faker.number.int();
  workorderItem.unitDiscountedPrice = faker.number.int();
  workorderItem.discountApprovedBy = null;
  workorderItem.promotion_id = null;
  workorderItem.userAssigned = createMockUser();
  workorderItem.itemStatus = {
    code: 'IN_PROGRESS',
    description: 'En progreso',
  };
  workorderItem.businessLineId = 1;
  workorderItem.createdAt = faker.date.past();
  workorderItem.updatedAt = faker.date.recent();
  workorderItem.workorder = workOrder;

  return workorderItem;
}

export function createReponseMockWorkorder(user: User): ResponseWorkorderDto {
  return new ResponseWorkorderDto(createMockWorkorder(user));
}

export function createResponseMockBudgetGroup(): ResponseConversationDto {
  return new ResponseConversationDto(createMockBudgetGroup());
}

export function createMockCustomer(): Customer {
  const customer = new Customer();

  customer.id = faker.string.uuid();
  customer.customerType = faker.helpers.arrayElement(['PERSON', 'COMPANY']);
  customer.createdAt = faker.date.past();
  customer.updatedAt = faker.date.recent();
  customer.vehiclesCustomer = [];
  customer.budgetGroups = [];
  customer.workorders = [];
  customer.customerPeople = null;

  return customer;
}

export function createMockVehicle(): Vehicle {
  const vehicle = new Vehicle();

  vehicle.id = faker.string.uuid();
  vehicle.plate = faker.vehicle.vrm();
  vehicle.color = faker.vehicle.color();
  vehicle.vehicleCatalog = createMockCatalogVehicle();

  return vehicle;
}

export function createMockCatalogVehicle(): CatalogVehicle {
  const catalogVehicle = new CatalogVehicle();

  catalogVehicle.id = faker.string.uuid();
  catalogVehicle.createdAt = faker.date.past();
  catalogVehicle.updatedAt = faker.date.recent();

  return catalogVehicle;
}

export function createMockChannel(): Channel {
  const channel = new Channel();
  channel.code = faker.string.alpha(4);
  channel.name = faker.lorem.word();
  return channel;
}

export function createMockBudget(): Budget {
  const budget = new Budget();
  budget.id = faker.string.uuid();
  budget.budgetGroup = createMockBudgetGroup();
  budget.notes = [];
  return budget;
}

export function createMockBudgetGroup(): BudgetGroup {
  const budgetGroup = new BudgetGroup();
  budgetGroup.id = faker.number.int();
  budgetGroup.store = mockStore;
  budgetGroup.customer = createMockCustomer();
  budgetGroup.lead = null;
  budgetGroup.vehicle = createMockVehicle();
  budgetGroup.createdAt = faker.date.past();
  budgetGroup.updatedAt = faker.date.recent();
  budgetGroup.sent = false;
  budgetGroup.budgets = [];
  budgetGroup.createdBy = createMockUser();
  budgetGroup.channel = createMockChannel();
  return budgetGroup;
}

export function createMockConsultationChannel(): ConsultationChannel {
  const consultationChannel = new ConsultationChannel();
  consultationChannel.id = faker.string.uuid();
  return consultationChannel;
}

export function createMockWorkorderStatus(): WorkorderStatus {
  const status = new WorkorderStatus();
  status.code = faker.helpers.arrayElement(['AWAITING_PAYMENT', 'IN_PROGRESS']);
  status.description = faker.lorem.sentence();
  return status;
}

describe('WorkordersService', () => {
  let service: WorkordersService;
  let workorderRepository: WorkorderRepository;
  let workorderItemRecordRepository: WorkorderItemRecordRepository;
  let budgetRepository: BudgetRepository;
  let budgetService: BudgetsService;
  let userRepository: UserRepository;
  let productRepository: ProductRepository;
  let roleRepository: RoleRepository;
  let workorderServicesItemsRepository: WorkorderServicesItemsRepository;

  beforeEach(async () => {
    const mockMinioService = {
      copyObject: jest.fn(),
      getBucket: jest.fn(),
    };

    const mockNoteFileRepository = {
      create: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        WorkordersService,
        {
          provide: WorkorderRepository,
          useValue: {
            findActivesByUserAndDate: jest.fn(),
            findActivesByUserAndDateReassigned: jest.fn(),
            findWorkOrdersByUserAssigned: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateWorkOrderItems: jest.fn(),
            updateWorkOrder: jest.fn(),
            findWorkOrderItemById: jest.fn(),
            updateWorkOrderItem: jest.fn(),
          },
        },
        {
          provide: BudgetRepository,
          useValue: {
            findBudgetById: jest.fn().mockResolvedValue({
              id: '200012',
              total: 1000,
            }),
            findById: jest.fn(),
          },
        },
        {
          provide: BudgetsService,
          useValue: {
            sentBudget: jest.fn(),
            updateBudgetStatus: jest.fn(),
            getProduct: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: NoteRepository,
          useValue: {
            updateNoteById: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            getDataForService: jest.fn(),
            findBySkuAndStore: jest.fn(),
            findTireBySku: jest.fn(),
            getProductCombo: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: ServiceRepository,
          useValue: {
            findByCodes: jest.fn(),
            findByCodeAndStore: jest.fn(),
          },
        },
        {
          provide: VehicleCustomerRepository,
          useValue: {
            save: jest.fn(),
            getVehicleCustomer: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WorkorderItemRecordRepository,
          useValue: {
            createWorkOrderItemRecord: jest.fn(),
            finishWorkOrderItemRecord: jest.fn(),
            findWorkOrderItemRecordByWorkOrderItemId: jest.fn(),
          },
        },
        {
          provide: VehiclesRepository,
          useValue: {
            findVehicleByPlate: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: WorkorderServicesItemsRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: ServiceItemsRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: ServiceItemsStatusesRepository,
          useValue: {
            findAll: jest.fn(),
            findByCode: jest.fn(),
          },
        },
        { provide: MinioService, useValue: mockMinioService },
        { provide: NoteFileRepository, useValue: mockNoteFileRepository },
      ],
    }).compile();

    service = module.get<WorkordersService>(WorkordersService);
    workorderRepository = module.get<WorkorderRepository>(WorkorderRepository);
    budgetRepository = module.get<BudgetRepository>(BudgetRepository);
    budgetService = module.get<BudgetsService>(BudgetsService);
    userRepository = module.get<UserRepository>(UserRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
    workorderItemRecordRepository = module.get<WorkorderItemRecordRepository>(WorkorderItemRecordRepository);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    workorderServicesItemsRepository = module.get<WorkorderServicesItemsRepository>(WorkorderServicesItemsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findActivesByUserAndDate', () => {
    it('should call workorderRepository.findActivesByUserAndDate and return an array of ResponseWorkorderDto', async () => {
      const date = '2024-10-03';
      const mockUser = createMockUser();
      const workordersMock = createMockWorkorder(mockUser);
      const mockStoreId = '123abc';
      jest.spyOn(workorderRepository, 'findActivesByUserAndDate').mockResolvedValue([workordersMock]);
      const result = await service.findByUserAndDate(mockUser.id, date, mockStoreId);
      expect(workorderRepository.findActivesByUserAndDate).toHaveBeenCalledWith(
        mockUser.id,
        new Date(`${date}T00:00:00`),
        mockStoreId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ResponseWorkorderDto);
    });
    it('should call workorderRepository.findActivesByUserAndDate and return an empty array', async () => {
      const date = '2024-10-03';
      const mockUser = createMockUser();
      const roleMock = 'db954877-3367-42ec-9aa3-afa1233758ec';
      const mockStoreId = '123abc';
      jest.spyOn(workorderRepository, 'findActivesByUserAndDate').mockResolvedValue([]);
      const result = await service.findByUserAndDate(mockUser.id, date, mockStoreId, roleMock);
      expect(workorderRepository.findActivesByUserAndDate).toHaveBeenCalledWith(
        mockUser.id,
        new Date(`${date}T00:00:00`),
        mockStoreId,
      );
      expect(result).toHaveLength(0);
    });
  });
  describe('findActivesByUserAndDateReassigned', () => {
    it('should call workorderRepository.findActivesByUserAndDateReassigned and return an array of ResponseWorkorderDto', async () => {
      const date = '2024-10-03';
      const mockUser = createMockUser();
      const workordersMock = createMockWorkorder(mockUser);
      const mockStoreId = '123abc';
      jest.spyOn(workorderRepository, 'findActivesByUserAndDateReassigned').mockResolvedValue([workordersMock]);
      const result = await service.findByUserAndDateReassigned(mockUser.id, date, mockStoreId);
      expect(workorderRepository.findActivesByUserAndDateReassigned).toHaveBeenCalledWith(
        mockUser.id,
        new Date(`${date}T00:00:00`),
        mockStoreId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ResponseWorkorderDto);
    });
  });
  describe('createWorkorder', () => {
    it('should call createWorkorder and return a ResponseWorkorderDto', async () => {
      const mockUser = createMockUser();
      const mockBudget = createMockBudget();
      const mockData = {
        budgetId: '200012',
        createdBy: mockUser.id,
        deliveryDate: '2024-10-03',
        deliveryTime: '10:00',
      };
      const mockWorkorder = createMockWorkorder(mockUser);

      jest.spyOn(budgetRepository, 'findById').mockResolvedValue(mockBudget);
      jest.spyOn(budgetService, 'sentBudget').mockResolvedValue([] as any);
      jest.spyOn(workorderRepository, 'create').mockResolvedValue(createMockWorkorder(mockUser));
      jest.spyOn(service, 'actualizeVehicleOdometerDate').mockResolvedValue();
      jest.spyOn(service, 'createWorkorderItem').mockResolvedValue([]);

      const result = await service.createWorkorder(mockData);

      expect(budgetRepository.findById).toHaveBeenCalledWith(mockData.budgetId);
      expect(budgetService.sentBudget).toHaveBeenCalled();
      expect(workorderRepository.create).toHaveBeenCalled();
      expect(service.actualizeVehicleOdometerDate).toHaveBeenCalledWith(
        mockBudget.budgetGroup.vehicle.id,
        mockWorkorder.createdAt,
      );
      expect(service.createWorkorderItem).toHaveBeenCalled();

      expect(result).toBeInstanceOf(ResponseWorkorderDto);
    });
  });

  describe('getWorkOrderById', () => {
    it('should call workorderRepository.findById and return a ResponseWorkorderDto', async () => {
      const mockUser = createMockUser();
      const mockWorkorder = createMockWorkorder(mockUser);
      const mockRoleId = 'db954877-3367-42ec-9aa3-afa1233758ec';
      const mockStoreId = '6075fa65-9dd1-464a-8314-26d926a0a964';
      const mockQuery = {
        searchMode: 'false',
        storeId: mockStoreId,
      };
      const mockRole = {
        id: mockStoreId,
        name: AppDomain.Roles.ADMIN,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(roleRepository, 'findById').mockResolvedValue(mockRole);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(mockWorkorder);

      const result = await service.findById(
        mockUser.id,
        mockWorkorder.id,
        mockRoleId,
        mockStoreId,

        mockQuery.searchMode,
      );

      expect(roleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(workorderRepository.findById).toHaveBeenCalledWith(mockWorkorder.id);
      expect(result).toBeInstanceOf(ResponseWorkorderDto);
    });
  });

  describe('deleteWorkOrderItem', () => {
    it('should call workorderRepository.deleteWorkOrderItem', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const itemId = '123';

      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);
      jest.spyOn(workorderRepository, 'updateWorkOrderItems').mockResolvedValue(workOrder);

      await service.deleteWorkOrderItem(mockUser.id, workOrder.id, itemId);

      expect(workorderRepository.updateWorkOrderItems).toHaveBeenCalled();
      expect(workorderRepository.findById).toHaveBeenCalledWith(workOrder.id);
    });
  });

  describe('updateWorkOrderItemTechnician', () => {
    it('should call workorderRepository.updateWorkOrderItems', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = workOrder.workOrderItems[0];
      const technicianId = mockUser.id;

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);
      jest.spyOn(workorderRepository, 'updateWorkOrderItems').mockResolvedValue(workOrder);

      await service.updateWorkOrderItemTechnician(mockUser.id, workOrder.id, workOrderItem.id.toString(), technicianId);

      expect(workorderRepository.updateWorkOrderItems).toHaveBeenCalled();
      expect(workorderRepository.findById).toHaveBeenCalledWith(workOrder.id);
    });

    it('should throw BadRequestException if workOrder is not found', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = workOrder.workOrderItems[0];
      const technicianId = '123456';

      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(null);

      await expect(
        service.updateWorkOrderItemTechnician(mockUser.id, workOrder.id, workOrderItem.id.toString(), technicianId),
      ).rejects.toThrow('WorkOrder Not found');
    });
  });

  describe('reassignWorkOrder', () => {
    it('should call workorderRepository.updateWorkOrder', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);
      jest.spyOn(workorderRepository, 'updateWorkOrder').mockResolvedValue([]);

      await service.reassignWorkOrder(mockUser.id, mockUser.id, workOrder.id.toString());

      expect(workorderRepository.updateWorkOrder).toHaveBeenCalled();
      expect(workorderRepository.findById).toHaveBeenCalledWith(workOrder.id);
    });

    it('should throw BadRequestException if workOrder is not found', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);

      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(null);

      await expect(service.reassignWorkOrder(mockUser.id, mockUser.id, workOrder.id.toString())).rejects.toThrow(
        'WorkOrder Not found',
      );
    });

    it('should add a new product to the workorder', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);
      const newProduct = createMockProduct();
      const body: any = {
        workOrderId: 'store-123',
        workOrderItem: {
          itemId: newProduct.id,
          quantity: 1,
          itemType: SalesDomain.ItemType.PRODUCT,
        },
      };
      jest.spyOn(productRepository, 'findBySkuAndStore').mockResolvedValue(newProduct);
      jest.spyOn(productRepository, 'findTireBySku').mockResolvedValue(createMockProductTire());
      jest.spyOn(productRepository, 'getProductCombo').mockResolvedValue(null);

      await service.addItemToWorkOrder(mockUser.id, body, body.workOrderId);
      expect(workorderRepository.updateWorkOrderItems).toHaveBeenCalledWith({
        id: workOrder.id,
        workOrderItems: expect.arrayContaining([
          expect.objectContaining({
            itemId: newProduct.id,
            quantity: 1,
            itemType: SalesDomain.ItemType.PRODUCT,
          }),
        ]),
      });
    });
  });

  describe('changeItemToWorkOrder', () => {
    it('should change an item in a work order successfully', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = createMockWorkorderItem();
      const workOrderId = '123';
      const newProduct = createMockProduct();
      const body: any = {
        workOrderItem: {
          itemId: newProduct.id,
          quantity: 1,
          itemType: SalesDomain.ItemType.PRODUCT,
        },
      };

      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);
      jest.spyOn(productRepository, 'findBySkuAndStore').mockResolvedValue(newProduct);
      jest.spyOn(productRepository, 'findTireBySku').mockResolvedValue(createMockProductTire());
      jest.spyOn(productRepository, 'getProductCombo').mockResolvedValue(null);
      jest.spyOn(workorderRepository, 'updateWorkOrderItems').mockResolvedValue(workOrder);
      const result = await service.changeItemToWorkOrder(mockUser.id, workOrderId, workOrderItem.id, body);
      expect(result).toEqual(new ResponseWorkorderDto(workOrder));
    });
  });

  describe('startOrFinishRecordTime', () => {
    test('should start or finish record time', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = createMockWorkorderItem(workOrder);
      const workOrderId = '123';
      const action = 'start';

      jest.spyOn(workorderRepository, 'findWorkOrderItemById').mockResolvedValue(workOrderItem);
      jest.spyOn(workorderItemRecordRepository, 'createWorkOrderItemRecord').mockResolvedValue(null);
      jest.spyOn(workorderRepository, 'updateWorkOrderItem').mockResolvedValue(null);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);

      const result = await service.startOrFinishRecordTime(
        mockUser.id,
        workOrderId,
        workOrderItem.id.toString(),
        action,
      );
      expect(result).toEqual(new ResponseWorkorderDto(workOrder));
    });
  });

  describe('finishWorkOrderItem', () => {
    test('should finish a work order item', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = createMockWorkorderItem(workOrder);
      const workOrderId = '123';

      jest.spyOn(workorderRepository, 'findWorkOrderItemById').mockResolvedValue(workOrderItem);
      jest.spyOn(workorderRepository, 'updateWorkOrderItem').mockResolvedValue(null);
      jest.spyOn(workorderRepository, 'findById').mockResolvedValue(workOrder);

      const result = await service.finishWorkOrderItem(mockUser.id, workOrderId, workOrderItem.id.toString(), true);
      expect(result).toEqual(new ResponseWorkorderDto(workOrder));
    });
  });

  describe('updateStatusServiceWorkOrder', () => {
    test('should update the status of a work order service item', async () => {
      const mockUser = createMockUser();
      const workOrder = createMockWorkorder(mockUser);
      const workOrderItem = createMockWorkorderItem(workOrder);
      const mockService = createMockService();
      const workOrderItemClone = { ...workOrderItem, workorder: undefined };

      const mockUpdatedServiceItem: WorkorderServicesItems = {
        id: 456,
        workorderItem: workOrderItemClone,
        serviceItem: mockService,
        assignedUser: mockUser,
        status: {
          code: SalesDomain.SERVICE_ITEM_STATUS.PENDING,
          description: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockBody: UpdateStatusDto = {
        workOrderServiceItemId: 456,
        status: 'OK',
      };

      jest.spyOn(workorderServicesItemsRepository, 'findById').mockResolvedValue(mockUpdatedServiceItem);
      jest.spyOn(workorderServicesItemsRepository, 'updateStatus').mockResolvedValue(mockUpdatedServiceItem);

      const result = await service.updateStatusServiceWorkOrder(mockBody, mockUser.id);

      expect(workorderServicesItemsRepository.findById).toHaveBeenCalledWith(mockBody.workOrderServiceItemId);
      expect(workorderServicesItemsRepository.updateStatus).toHaveBeenCalledWith(
        mockBody.workOrderServiceItemId,
        mockBody.status,
        mockUser.id,
      );
      expect(result).toEqual(new CoreDtos.UpdateStatusServiceItemDto(mockUpdatedServiceItem));
    });

    test('should throw NotFoundException if the service item does not exist', async () => {
      const mockUser = createMockUser();

      const mockBody: UpdateStatusDto = {
        workOrderServiceItemId: 456,
        status: 'OK',
      };

      jest.spyOn(workorderServicesItemsRepository, 'findById').mockResolvedValue(null);
      await expect(service.updateStatusServiceWorkOrder(mockBody, mockUser.id)).rejects.toThrow(NotFoundException);
      expect(workorderServicesItemsRepository.findById).toHaveBeenCalledWith(mockBody.workOrderServiceItemId);
    });
  });
});
