/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetGroup } from 'src/infrastructure/database/entities/budget-group.entity';
import { CatalogVehicle } from 'src/infrastructure/database/entities/catalog-vehicle.entity';
import { ProductTire } from 'src/infrastructure/database/entities/product-tire.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository';
import { ConsultationChannelRepository } from 'src/infrastructure/database/repositories/consultation-channel.repository';
import { CustomerPeopleRepository } from 'src/infrastructure/database/repositories/customer-people.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { ServiceRepository } from 'src/infrastructure/database/repositories/service.repository';
import { SystemParameterRepository } from 'src/infrastructure/database/repositories/system-parameter.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { createMockUser } from 'src/modules/admin/users/users.service.spec';
import { mockStore } from 'src/modules/security/authentication/authentication.service.spec';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { PatchUpdateItemDto, PostNewItemDto } from '../conversations/conversations.dto';
import { ResponseConversationDto } from '../conversations/response-conversation.dto';
import { BudgetsService } from './budgets.service';
import { ServiceItemsRepository } from 'src/infrastructure/database/repositories/service-items.repository';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { BudgetItemRepository } from 'src/infrastructure/database/repositories/budget-item.repository';
import { SearchCriteriaRepository } from 'src/infrastructure/database/repositories/search-criteria.repository';
import { SearchHistoryRepository } from 'src/infrastructure/database/repositories/search-history.repository';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';

export function createMockCatalogVehicle(): CatalogVehicle {
  const catalogVehicle = new CatalogVehicle();

  catalogVehicle.id = faker.string.uuid();
  catalogVehicle.createdAt = faker.date.past();
  catalogVehicle.updatedAt = faker.date.recent();
  catalogVehicle.year = 2020;

  return catalogVehicle;
}

export function createMockConversation(user: User): BudgetGroup {
  const budgetGroup = new BudgetGroup();

  budgetGroup.id = faker.number.int();
  budgetGroup.createdBy = user;
  budgetGroup.vehicle = {
    id: faker.string.uuid(),
    plateCountry: 'CL',
    plate: faker.vehicle.vrm(),
    color: faker.vehicle.color(),
    vehicleCatalog: createMockCatalogVehicle(),
    vehiclesCustomer: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    budgetGroups: [],
    workorders: [],
    odometer: faker.number.int(),
    odometerUpdateDate: faker.date.recent(),
    technicalReviewMonth: null,
    owner: faker.vehicle.vehicle(),
  };
  budgetGroup.createdAt = faker.date.past();
  budgetGroup.updatedAt = faker.date.recent();
  budgetGroup.expiresAt = faker.date.soon();
  budgetGroup.extended = faker.datatype.boolean();
  budgetGroup.sent = faker.datatype.boolean();
  budgetGroup.deleted = faker.datatype.boolean();
  budgetGroup.budgets = [];
  budgetGroup.store = mockStore;
  budgetGroup.channel = createMockChannel();

  return budgetGroup;
}

const createMockChannel = () => {
  return {
    code: faker.string.alphanumeric(6),
    name: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    workorders: [],
    budgetGroups: [],
  };
};

export const createMockBudgets = (budgetGroup: BudgetGroup) => {
  return [
    {
      id: 'budget-123',
      total: faker.number.int(),
      iva: faker.number.int(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      appointments: [],
      budgetItems: [],
      subTotal: faker.number.int(),
      workorder: null,
      sent: faker.number.int(),
      sentAt: faker.date.recent(),
      status: {
        code: SalesDomain.BUDGET_STATUS.CREATING,
        description: 'CREATING',
        budgets: [],
      },
      budgetGroup: budgetGroup,
      notes: [],
      searchHistories: [],
    },
  ];
};

export const createMockProduct = () => {
  return {
    id: faker.string.uuid(),
    noReplenish: faker.datatype.boolean(),
    stocks: [],
    showInPlp: faker.datatype.boolean(),
    description: faker.commerce.productDescription(),
    priceList: faker.number.int(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    productPrices: [
      {
        priceTmk: 100,
        store: mockStore,
        id: 1,
        product: null,
        priceStore: 100,
        priceWeb: 100,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    ],
    productTire: null,
    businessLine: {
      id: faker.number.int(),
      name: faker.commerce.department(),
      active: faker.datatype.boolean(),
      image: faker.image.url(),
      url: faker.internet.url(),
      order: faker.number.int(),
      code: faker.string.alphanumeric(6),
      description: faker.commerce.productDescription(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      products: [],
      brands: [],
    },
  };
};

const createMockService = () => {
  return {
    code: faker.string.alphanumeric(6),
    description: faker.commerce.productDescription(),
    applyToCar: true,
    subcategoryId: null,
    fixedQuantity: false,
    price: faker.number.int(),
    explanationTitle: 'Explanation title',
    explanationDescription: 'Explanation description',
    prices: [],
    combos: [],
    comboItems: [],
    sortOrder: faker.number.int(),
    businessLine: null,
    imageUrl: faker.image.url(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createMockProductTire = (): ProductTire => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    emotionalDescription: faker.commerce.productAdjective(),
    design: faker.commerce.productName(),
    tireConstruction: faker.helpers.arrayElement(['R', 'D']),
    width: faker.number.int({ min: 145, max: 315 }),
    profile: faker.number.int({ min: 30, max: 80 }),
    rim: faker.number.int({ min: 12, max: 22 }),
    speedIndex: faker.helpers.arrayElement(['H', 'V', 'W', 'Y', 'Z']),
    loadIndex: faker.helpers.arrayElement(['85', '90', '95', '100']),
    utqgScore: `${faker.number.int({ min: 100, max: 800 })}`,
    percentageOnRoad: faker.number.int({ min: 0, max: 100 }),
    percentageOffRoad: faker.number.int({ min: 0, max: 100 }),
    useCar: faker.datatype.boolean(),
    useSuv: faker.datatype.boolean(),
    useSport: faker.datatype.boolean(),
    usePickup: faker.datatype.boolean(),
    useCommercial: faker.datatype.boolean(),
    highwayCompatible: faker.datatype.boolean(),
    reinforced: faker.datatype.boolean(),
    runFlat: faker.datatype.boolean(),
    warrantyLeon: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    product: createMockProduct(),
    brand: null,
  };
};

describe('BudgetsService', () => {
  let service: BudgetsService;
  let budgetRepository: jest.Mocked<BudgetRepository>;
  let customerRepository: CustomerRepository;
  let productRepository: jest.Mocked<ProductRepository>;
  let serviceRepository: jest.Mocked<ServiceRepository>;
  let consultationChannelRepository: ConsultationChannelRepository;
  let noteRespository: jest.Mocked<NoteRepository>;
  let leadRepository: jest.Mocked<LeadRepository>;
  let budgetGroupRepository: jest.Mocked<BudgetGroupRepository>;
  let logger: Logger;
  let budgetServicesItemsRepository: BudgetServicesItemsRepository;
  let serviceItemsRepository: ServiceItemsRepository;
  let serviceItemsStatusesRepository: ServiceItemsStatusesRepository;

  beforeEach(async () => {
    const mockBudgetRepository = {
      updateBudgetStatus: jest.fn(),
      findById: jest.fn(),
      updateBudgetItems: jest.fn(),
      updateBudgetSent: jest.fn(),
      createBudget: jest.fn(),
      create: jest.fn(),
      createBudgetItems: jest.fn(),
      findByIdAndUser: jest.fn(),
      deleteBudget: jest.fn(),
    };

    const mockBudgetGroupRepository = {
      findConversationsByUserAndDate: jest.fn(),
      findBudgetsByUserAndDate: jest.fn(),
      findByUserAndDate: jest.fn(),
      findById: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findBySkuAndStore: jest.fn(),
      findTireBySku: jest.fn(),
      getProductCombo: jest.fn(),
    };

    const mockServiceRepository = {
      findByCodeAndStore: jest.fn(),
      findByCodes: jest.fn(),
    };

    const mockNoteRepository = {
      getNotesByBudgetId: jest.fn(),
      deleteNoteById: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
    };

    const mockLeadRepository = {
      findByEmail: jest.fn(),
    };

    const mockCustomerPeopleRepository = {
      findByEmail: jest.fn(),
    };

    const mockVehicleRepository = {
      findByEmail: jest.fn(),
    };

    const mockBudgetServicesItemsRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const mockServiceItemsRepository = {
      findAll: jest.fn(),
    };

    const mockServiceItemsStatusesRepository = {
      findAll: jest.fn(),
      findByCode: jest.fn(),
    };

    const mockBudgetItemRepository = {
      updateItem: jest.fn(),
      findByIdItemAndBudgetId: jest.fn(),
    };

    const mockSearchCriteriaRepository = {
      findByCode: jest.fn(),
    };

    const mockSearchHistoryRepository = {
      save: jest.fn(),
      findByBudgetId: jest.fn(),
    };

    const mockRoleRepository = {
      findById: jest.fn(),
    };

    const mockMinioService = {
      copyObject: jest.fn(),
      getBucket: jest.fn(),
    };

    const mockNoteFileRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: BudgetRepository, useValue: mockBudgetRepository },
        { provide: BudgetGroupRepository, useValue: mockBudgetGroupRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: CustomerRepository, useValue: {} },
        { provide: ServiceRepository, useValue: mockServiceRepository },
        { provide: ConsultationChannelRepository, useValue: {} },
        { provide: Logger, useValue: mockLogger },
        { provide: SystemParameterRepository, useValue: { getConversationExpirationTime: jest.fn() } },
        { provide: NoteRepository, useValue: mockNoteRepository },
        { provide: LeadRepository, useValue: mockLeadRepository },
        { provide: CustomerPeopleRepository, useValue: mockCustomerPeopleRepository },
        { provide: VehiclesRepository, useValue: mockVehicleRepository },
        { provide: BudgetServicesItemsRepository, useValue: mockBudgetServicesItemsRepository },
        { provide: ServiceItemsRepository, useValue: mockServiceItemsRepository },
        { provide: ServiceItemsStatusesRepository, useValue: mockServiceItemsStatusesRepository },
        { provide: BudgetItemRepository, useValue: mockBudgetItemRepository },
        { provide: SearchCriteriaRepository, useValue: mockSearchCriteriaRepository },
        { provide: SearchHistoryRepository, useValue: mockSearchHistoryRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: MinioService, useValue: mockMinioService },
        { provide: NoteFileRepository, useValue: mockNoteFileRepository },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    budgetRepository = module.get<BudgetRepository>(BudgetRepository) as jest.Mocked<BudgetRepository>;
    budgetGroupRepository = module.get<BudgetGroupRepository, jest.Mocked<BudgetGroupRepository>>(
      BudgetGroupRepository,
    );
    productRepository = module.get<ProductRepository>(ProductRepository) as jest.Mocked<ProductRepository>;
    serviceRepository = module.get<ServiceRepository>(ServiceRepository) as jest.Mocked<ServiceRepository>;

    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call updateBudgetStatus on the repository with correct parameters', async () => {
    const ids = ['1', '2'];
    const statusCode = 'APPROVED';

    await service.updateBudgetStatus(ids, statusCode);

    expect(logger.log).toHaveBeenCalledWith('changeStatus');
    expect(budgetRepository.updateBudgetStatus).toHaveBeenCalledWith(ids, statusCode);
  });

  it('should call logger and repository in findByUserAndDate and return mapped conversations', async () => {
    const mockUserId = 'user-123';
    const mockDate = '2024-09-30';
    const mockStoreId = 'store-123';
    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);

    budgetGroupRepository.findConversationsByUserAndDate.mockResolvedValue([mockConversation]);

    const result = await service.getConversationsByUser(mockUserId, mockDate, mockStoreId);

    expect(logger.log).toHaveBeenCalledWith('getConversationsByUser');
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(ResponseConversationDto);
  });

  it('should call repository in findByUserAndDateAndBudgets and return mapped conversations', async () => {
    const mockUserId = 'user-123';
    const mockStoreId = 'store-123';
    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);

    budgetGroupRepository.findBudgetsByUserAndDate.mockResolvedValue([mockConversation]);

    const result = await service.getBudgetsByUser(mockUserId, mockStoreId);

    expect(budgetGroupRepository.findBudgetsByUserAndDate).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(ResponseConversationDto);
  });

  it('should update the budget item if user has permission', async () => {
    const mockUserId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = 'item-123';
    const body: PatchUpdateItemDto = {
      quantity: 5,
      isChecked: true,
      searchByVehicle: false,
      doublePlp: false,
      measureDouble: {
        front: { width: null, profile: null, rim: null },
        rear: { width: null, profile: null, rim: null },
      },
    };
    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = mockUserId;
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(mockConversation.budgets[0]);
    budgetGroupRepository.findById.mockResolvedValue(createMockConversation(mockUser));

    await service.updateItemToConversation(mockUserId, budgetId, budgetItemId, body);

    expect(budgetRepository.updateBudgetItems).toHaveBeenCalledWith({
      id: budgetId,
      budgetItems: [],
    });
    expect(logger.log).toHaveBeenCalledWith('updateItemToConversation');
  });

  it('should throw BadRequestException if budget is not found', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = 'item-123';
    const body: PatchUpdateItemDto = {
      quantity: 5,
      isChecked: true,
      searchByVehicle: false,
      doublePlp: false,
      measureDouble: {
        front: { width: null, profile: null, rim: null },
        rear: { width: null, profile: null, rim: null },
      },
    };
    budgetRepository.findById.mockResolvedValue(null);

    await expect(service.updateItemToConversation(userId, budgetId, budgetItemId, body)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if user does not own the budget', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = 'item-123';
    const body: PatchUpdateItemDto = {
      quantity: 5,
      isChecked: true,
      searchByVehicle: false,
      doublePlp: false,
      measureDouble: {
        front: { width: null, profile: null, rim: null },
        rear: { width: null, profile: null, rim: null },
      },
    };

    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = 'different-user';
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(service.updateItemToConversation(userId, budgetId, budgetItemId, body)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update quantity of service item if applyToCar is true', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = 'item-123';
    const body: PatchUpdateItemDto = {
      quantity: 5,
      isChecked: true,
      searchByVehicle: false,
      doublePlp: false,
      measureDouble: {
        front: { width: null, profile: null, rim: null },
        rear: { width: null, profile: null, rim: null },
      },
    };
    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = userId;
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(mockConversation.budgets[0]);
    productRepository.findBySkuAndStore.mockResolvedValue(createMockProduct());
    serviceRepository.findByCodeAndStore.mockResolvedValue(createMockService());
    budgetGroupRepository.findById.mockResolvedValue(createMockConversation(mockConversation.createdBy));

    await service.updateItemToConversation(userId, budgetId, budgetItemId, body);

    expect(budgetRepository.updateBudgetItems).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('updateItemToConversation');
  });

  it('should delete the budget item if user has permission', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = '123';

    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = userId;
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);
    mockConversation.budgets[0].budgetItems = [
      {
        id: 123,
        itemType: 'SERVICE',
        itemId: 'service-123',
        itemComboId: null,
        unitPrice: 100,
        budget: mockConversation.budgets[0],
        quantity: 1,
        isChecked: false,
        businessLineId: null,
        budgetServicesItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    budgetRepository.findByIdAndUser.mockResolvedValue(mockConversation.budgets[0]);
    budgetGroupRepository.findById.mockResolvedValue(createMockConversation(mockUser));

    await service.deleteItemToConversation(userId, budgetId, budgetItemId);

    expect(budgetRepository.updateBudgetItems).toHaveBeenCalledWith({
      id: budgetId,
      budgetItems: [],
    });
  });

  it('should throw BadRequestException if budget is not found', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = '123';

    budgetRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(service.deleteItemToConversation(userId, budgetId, budgetItemId)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if user does not own the budget', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';
    const budgetItemId = '123';

    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = 'different-user';
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(null);

    await expect(service.deleteItemToConversation(userId, budgetId, budgetItemId)).rejects.toThrow(BadRequestException);
  });

  it('should update the budget sent if user has permission', async () => {
    const userId = 'user-123';
    const budgetId = 'budget-123';

    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = userId;
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(mockConversation.budgets[0]);
    budgetGroupRepository.findById.mockResolvedValue(createMockConversation(mockUser));

    await service.sentBudget(userId, budgetId);

    expect(budgetRepository.updateBudgetSent).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('sentBudget');
  });

  it('it should copy the budget of the reference budget', async () => {
    const userId = 'user-123';
    const referenceBudgetId = 'budget-123';

    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    mockConversation.createdBy.id = userId;
    mockConversation.store = mockStore;
    mockConversation.budgets = createMockBudgets(mockConversation);

    budgetRepository.findByIdAndUser.mockResolvedValue(mockConversation.budgets[0]);
    budgetGroupRepository.findById.mockResolvedValue(createMockConversation(mockUser));
    budgetRepository.create.mockResolvedValue(mockConversation.budgets[0]);

    await service.createBudget(userId, referenceBudgetId);

    expect(budgetRepository.createBudgetItems).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('createBudget', {
      budgetIdReference: referenceBudgetId,
      userId,
    });
  });
  it('should add a new product to the budget', async () => {
    const mockUser = createMockUser();
    const budgetGroup = createMockConversation(mockUser);
    const budget = createMockBudgets(budgetGroup)[0];
    budgetRepository.findByIdAndUser.mockResolvedValue(budget);
    budgetGroupRepository.findById.mockResolvedValue(budgetGroup);
    const newProduct = createMockProduct();
    const body: PostNewItemDto = {
      storeId: 'store-123',
      channel: 'f9130d7b-23c3-464c-a565-071be0da31af',
      budgetItem: {
        itemId: newProduct.id,
        quantity: 1,
        itemType: SalesDomain.ItemType.PRODUCT,
        businessLineId: 1,
      },
    };
    productRepository.findBySkuAndStore.mockResolvedValue(newProduct);
    productRepository.findTireBySku.mockResolvedValue(createMockProductTire());
    productRepository.getProductCombo.mockResolvedValue(null);
    await service.addItemToConversation(mockUser.id, body.budgetItem.itemId, body);
    expect(budgetRepository.updateBudgetItems).toHaveBeenCalledWith({
      id: budget.id,
      budgetItems: expect.arrayContaining([
        expect.objectContaining({
          itemId: newProduct.id,
          quantity: 1,
          itemType: SalesDomain.ItemType.PRODUCT,
        }),
      ]),
    });
  });

  describe('deleteBudget', () => {
    const mockUser = createMockUser();
    const mockConversation = createMockConversation(mockUser);
    const mockBudget = createMockBudgets(mockConversation);

    it('should delete a budget successfully', async () => {
      jest.spyOn(budgetRepository, 'findByIdAndUser').mockResolvedValue(mockBudget[0]);
      jest.spyOn(budgetRepository, 'deleteBudget').mockResolvedValue(undefined);

      await service.deleteBudget(mockBudget[0].id, mockUser.id);

      expect(budgetRepository.findByIdAndUser).toHaveBeenCalledWith(mockBudget[0].id, mockUser.id);
      expect(budgetRepository.deleteBudget).toHaveBeenCalledWith(mockBudget[0].id); // Corregido
    });

    it('should throw NotFoundException if budget does not exist', async () => {
      jest.spyOn(budgetRepository, 'findByIdAndUser').mockResolvedValue(null);

      await expect(service.deleteBudget(mockBudget[0].id, mockUser.id)).rejects.toThrow(NotFoundException);
      expect(budgetRepository.findByIdAndUser).toHaveBeenCalledWith(mockBudget[0].id, mockUser.id);
    });
  });
});
