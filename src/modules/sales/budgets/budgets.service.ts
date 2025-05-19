import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BudgetItem } from 'src/infrastructure/database/entities/budget-item.entity';
import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { Lead } from 'src/infrastructure/database/entities/lead.entity';
import { Note } from 'src/infrastructure/database/entities/note.entity';
import { Product } from 'src/infrastructure/database/entities/product.entity';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository';
import { ConsultationChannelRepository } from 'src/infrastructure/database/repositories/consultation-channel.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { ServiceRepository } from 'src/infrastructure/database/repositories/service.repository';
import { SystemParameterRepository } from 'src/infrastructure/database/repositories/system-parameter.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { CustomerPeopleRepository } from '../../../infrastructure/database/repositories/customer-people.repository';
import {
  BudgetItemRequestDto,
  PatchUpdateItemDto,
  PostConversationDto,
  PostNewItemDto,
  PutChangeItemDto,
  UpdateBudgetDto,
} from '../conversations/conversations.dto';
import { ResponseConversationDto } from '../conversations/response-conversation.dto';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { ServiceItemsRepository } from 'src/infrastructure/database/repositories/service-items.repository';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { UpdateStatusDto } from './get-budgets.dto';
import { BudgetItemRepository } from 'src/infrastructure/database/repositories/budget-item.repository';
import { SERVICES_ITEM } from 'src/modules/common/constants';
import { CoreDtos } from 'src/shared/dtos/core.dto';
import { SearchCriteriaRepository } from 'src/infrastructure/database/repositories/search-criteria.repository';
import { SearchHistoryRepository } from 'src/infrastructure/database/repositories/search-history.repository';
import { SearchHistory } from 'src/infrastructure/database/entities/search-history';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';

@Injectable()
export class BudgetsService {
  private readonly TIME_ZERO = 'T00:00:00';
  private readonly SEGURITY_CHECK_SERVICE_CODE = 'RTP';
  private readonly FIRST_ITEM = 0;
  private readonly TYPE_BUDGETS = 'budgets';
  constructor(
    private readonly logger: Logger,
    private readonly budgetGroupRepository: BudgetGroupRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly consultationChannelRepository: ConsultationChannelRepository,
    private readonly systemParameterRepository: SystemParameterRepository,
    private readonly noteRepository: NoteRepository,
    private readonly leadRepository: LeadRepository,
    private readonly customerPeopleRepository: CustomerPeopleRepository,
    private readonly vehiclesRepository: VehiclesRepository,
    private readonly budgetServicesItemsRepository: BudgetServicesItemsRepository,
    private readonly serviceItemsRepository: ServiceItemsRepository,
    private readonly serviceItemsStatusesRepository: ServiceItemsStatusesRepository,
    private readonly budgetItemRepository: BudgetItemRepository,
    private readonly searchCriteriaRepository: SearchCriteriaRepository,
    private readonly searchHistoryRepository: SearchHistoryRepository,
    private readonly roleRepository: RoleRepository,
    private readonly minioService: MinioService,
    private readonly noteFileRepository: NoteFileRepository,
  ) {}
  async updateBudgetStatus(ids: string[], statusCode: string) {
    this.logger.log('changeStatus');
    await this.budgetRepository.updateBudgetStatus(ids, statusCode);
  }

  async getConversationsByUser(userId: string, date: string, store: any): Promise<ResponseConversationDto[]> {
    this.logger.log('getConversationsByUser');
    const formattedDate = new Date(date + this.TIME_ZERO);
    const conversations = await this.budgetGroupRepository.findConversationsByUserAndDate(userId, formattedDate, store);
    return conversations.map((conversation) => new ResponseConversationDto(conversation));
  }

  async getBudgetsByUser(userId: string, store): Promise<ResponseConversationDto[]> {
    this.logger.log('getBudgetsByUser');
    const conversations = await this.budgetGroupRepository.findBudgetsByUserAndDate(userId, new Date(), store);
    return conversations.map((conversation) => new ResponseConversationDto(conversation));
  }

  async createConversation(userId: string, body: PostConversationDto): Promise<ResponseConversationDto> {
    this.logger.log('createConversation');
    if (body.customerId && body.customerId !== null) {
      body.leadId = null;
      const customer = await this.customerRepository.findById(body.customerId);
      if (!customer) {
        throw new BadRequestException('Not found customer');
      }
    }

    if (body.consultationChannelId && body.consultationChannelId !== null) {
      const consultationChannel = await this.consultationChannelRepository.findById(body.consultationChannelId);
      if (!consultationChannel) {
        throw new BadRequestException('Not found consultation channel');
      }
    }
    const expirationTime = parseInt(await this.systemParameterRepository.getConversationExpirationTime());

    const newBudgetGroup = await this.budgetGroupRepository.create({
      channel: {
        code: body.channel,
      },
      vehicle: { id: body.vehicleId },
      customer: { id: body.customerId },
      lead: { id: body.leadId },
      budgets: [],
      consultationChannel: { id: body.consultationChannelId },
      sent: false,
      createdBy: { id: userId },
      expiresAt: this.addHoursToDate(new Date(), expirationTime),
      store: { id: body.storeId },
    });

    const budgetItems: any = await this.getBudgetItems(body);

    let budgetItemsFiltered = [];

    const product = budgetItems.filter((item) => item.itemType === SalesDomain.ItemType.PRODUCT);
    if (product.length > 1) {
      const businessLine = product[0].businessLineId;
      budgetItemsFiltered = budgetItems.filter((item, index, self) =>
        this.filterItemsApplyToCar(item, index, self, businessLine),
      );
    } else {
      budgetItemsFiltered = budgetItems;
    }

    if (body.budget?.items[0]?.itemId === this.SEGURITY_CHECK_SERVICE_CODE) {
      await this.addSecurityCheckToBudget(newBudgetGroup.budgets[0], body.budget.items[0].itemId);
    } else {
      await this.budgetRepository.updateBudgetItems({
        id: newBudgetGroup.budgets[0].id,
        budgetItems: budgetItemsFiltered,
      });
    }

    const conversation = await this.budgetGroupRepository.findById(newBudgetGroup.id);

    await this.registerVehicleSearchCriteria(conversation.budgets?.[0], body);

    await this.processBudgetItems(conversation, body.storeId);
    return new ResponseConversationDto(conversation);
  }

  async findConversationById(
    userId: string,
    conversationId: number,
    storeId: string,
    role: string,
  ): Promise<ResponseConversationDto> {
    const roleName = await this.roleRepository.findById(role);
    let conversation = null;

    switch (roleName.name) {
      case AppDomain.Roles.ADMIN:
        conversation = await this.budgetGroupRepository.findByIdUserAndStore(conversationId, userId, storeId);
        break;
      case AppDomain.Roles.JEFE_DE_SERVICIO:
        conversation = await this.budgetGroupRepository.findByIdUserAndStore(conversationId, userId, storeId);
        break;
      case AppDomain.Roles.MAESTRO:
      case AppDomain.Roles.MAESTRO_ALINEADOR:
        conversation = await this.budgetGroupRepository.findByIdAndStore(conversationId, storeId);
        break;
    }
    if (!conversation) {
      throw new NotFoundException();
    }
    await this.processBudgetItems(conversation, conversation.store.id);
    return new ResponseConversationDto(conversation);
  }

  async deleteConversation(userId: string, conversationId: number): Promise<void> {
    this.logger.log('deleteConversation');
    const budgetGroup = await this.budgetGroupRepository.findByIdAndUser(conversationId, userId);

    if (!budgetGroup) {
      throw new NotFoundException();
    }

    if (budgetGroup?.sent) {
      throw new BadRequestException('Cannot delete a sent budget');
    }

    await this.searchHistoryRepository.deleteByBudgetId(budgetGroup.budgets[0].id);

    for (const budget of budgetGroup.budgets) {
      await this.deleteNotes(budget.notes);
    }

    await this.budgetGroupRepository.delete(conversationId);
  }

  async deleteNotes(notes: Note[]): Promise<void> {
    if (!notes.length) return;

    await Promise.all(
      notes.map(async (note) => {
        await this.noteRepository.deleteNoteById(note.id);
      }),
    );
  }

  async validateAddItem(
    budget: Budget,
    body: PostNewItemDto,
  ): Promise<{ shouldApplyChanges: boolean; hasExistingSearch: boolean }> {
    this.logger.log('Validating item addition');
    const isSearchByVehicle = await this.searchHistoryRepository.findByBudgetId(budget.id);

    const hasExistingSearch = isSearchByVehicle.length > 0;
    const shouldApplyChanges = !!isSearchByVehicle.length || !!body.searchByVehicle;

    return { shouldApplyChanges, hasExistingSearch };
  }

  private async applyVehicleSearchChanges(budget: Budget, body: any, hasExistingSearch: boolean): Promise<void> {
    this.logger.log('Applying vehicle search changes');

    const products = budget.budgetItems.filter(
      (i) => i.itemType === SalesDomain.ItemType.PRODUCT && i.businessLineId == AppDomain.BUSINESS_LINES.TIRE,
    );
    if (products.length > 0) await this.removeProductsFromBudget(budget, products);

    if (body.vehicleId) await this.budgetGroupRepository.updateVehicle(budget.budgetGroup.id, body.vehicleId);

    if (!hasExistingSearch) {
      await this.registerVehicleSearchCriteria(budget, body);
    }
  }

  async addItemToConversation(
    userId: string,
    budgetId: string,
    body: PostNewItemDto,
    validateItem: boolean = true,
  ): Promise<ResponseConversationDto> {
    this.logger.log('addItemToConversation', body);

    const budget = await this.budgetRepository.findByIdAndUser(budgetId, userId);
    if (!budget) {
      throw new BadRequestException('Not found budget');
    }
    if (
      validateItem &&
      body.itemIndex === this.FIRST_ITEM &&
      body.budgetItem.itemType === SalesDomain.ItemType.PRODUCT
    ) {
      const { shouldApplyChanges, hasExistingSearch } = await this.validateAddItem(budget, body);
      if (shouldApplyChanges) {
        await this.applyVehicleSearchChanges(budget, body, hasExistingSearch);
      }
    }

    if (body.budgetItem.itemType === SalesDomain.ItemType.SERVICE) {
      const response = this.addSecurityCheck(budget, body);
      return response;
    }
    this.validateProductAddition(budget, body);

    const productExists = budget.budgetItems.some(
      (item) => item.itemId === body.budgetItem.itemId && item.itemType === SalesDomain.ItemType.PRODUCT,
    );

    if (productExists) {
      await this.updateExistingProductAndServices(budget, body);
    } else {
      const newBudgetItems =
        body.budgetItem.itemType === SalesDomain.ItemType.PRODUCT
          ? await this.handleProductBudgetItems(budget, body)
          : await this.handleServiceBudgetItems(body);
      budget.budgetItems = this.updateCheckedStatusForMatchingServices(budget.budgetItems, newBudgetItems);
      budget.budgetItems.push(...newBudgetItems);
    }
    await this.budgetRepository.updateBudgetItems({
      id: budget.id,
      budgetItems: budget.budgetItems,
    });

    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    return new ResponseConversationDto(conversation);
  }

  async deleteBudget(budgetId: string, userId: any): Promise<void> {
    this.logger.log('deleteBudget');

    const budget = await this.budgetRepository.findByIdAndUser(budgetId, userId);
    if (!budget) {
      throw new NotFoundException();
    }
    if (budget.status.code === SalesDomain.BUDGET_STATUS.SENT) {
      throw new BadRequestException('Cannot delete a sent budget');
    }

    if (budget.budgetItems && budget.budgetItems.length > 0) {
      const itemSegurity = budget.budgetItems.find((item) => item.itemId === this.SEGURITY_CHECK_SERVICE_CODE);
      if (itemSegurity) {
        await this.budgetItemRepository.deleteItem(itemSegurity.id);
        budget.budgetItems = budget.budgetItems.filter((item) => item.id !== itemSegurity.id);
      }

      for (const item of budget.budgetItems) {
        if (item.itemType === SalesDomain.ItemType.PRODUCT) {
          const updatedBudgetItems = await this.deleteItemWithCombo(budget, item.id.toString());
          await this.budgetRepository.updateBudgetItems({
            id: budget.id,
            budgetItems: updatedBudgetItems || [],
          });
        }
      }
    }

    if (budget.notes && budget.notes.length > 0) {
      for (const note of budget.notes) {
        await this.noteRepository.deleteNoteById(note.id);
      }
    }

    await this.budgetRepository.deleteBudget(budgetId);
  }

  async getLeadById(leadId: string): Promise<Lead> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException();
    }
    return lead;
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundException();
    }
    return customer;
  }

  async updateConversationDataById(
    userId: string,
    conversationId: number,
    body: UpdateBudgetDto,
  ): Promise<ResponseConversationDto> {
    const conversation = await this.budgetGroupRepository.findByIdAndUser(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException();
    }
    const customer = body.customerId || null;
    const lead = body.leadId || null;
    const vehicle = body.vehicleId || null;

    await this.budgetGroupRepository.updateVehicleCustomerAndLead(conversation, customer, lead, vehicle);

    const updatedConversation = await this.budgetGroupRepository.findById(conversationId);
    return new ResponseConversationDto(updatedConversation);
  }

  async updateStatusServiceBudget(body: UpdateStatusDto, user: string) {
    this.logger.log('updateStatusServiceBudget');
    const serviceItem = await this.budgetServicesItemsRepository.findById(body.budgetServiceItemId);
    if (!serviceItem) {
      throw new NotFoundException();
    }

    if (serviceItem.status.code != SalesDomain.SERVICE_ITEM_STATUS.PENDING) {
      throw new BadRequestException('Service item status is not pending');
    }

    const response = await this.budgetServicesItemsRepository.updateStatus(body.budgetServiceItemId, body.status, user);
    return new CoreDtos.UpdateStatusServiceItemDto(response);
  }

  private async getBudgetItems(body: PostConversationDto): Promise<BudgetItem[]> {
    const budgetItems = [];
    if (Array.isArray(body.budget.items)) {
      for (const item of body.budget.items) {
        if (item.itemType === SalesDomain.ItemType.PRODUCT && item.quantity > 0) {
          try {
            const items = await this.getBudgetItemsForProduct(item, body.storeId, body.channel);
            budgetItems.push(...items);
          } catch (error) {
            console.error(`Error processing item ${item.itemId}:`, error);
          }
        }
      }
    } else {
      throw new BadRequestException('budget.items must be an array');
    }

    return budgetItems;
  }

  private async getBudgetItemsForProduct(item: BudgetItemRequestDto, storeId: string, channelCode: string) {
    const budgetItems = [];
    const budgetItemsFromCombo = [];
    this.logger.log(`Item: ${JSON.stringify(item)}`);
    const product = await this.getProduct(item.itemId, storeId);
    this.logger.log(`Product: ${JSON.stringify(product)}`);
    const budgetItem = {
      itemType: item.itemType,
      itemId: product.id,
      unitPrice: SalesDomain.getPriceForChannel(product.productPrices[0], channelCode),
      quantity: item.quantity,
      businessLineId: product.businessLine.id,
      data: null,
    };

    const combo = await this.productRepository.getProductCombo(storeId, product.productTire.rim);

    if (combo) {
      const comboItemsData = await Promise.all(
        combo.comboItems.map(async (comboItem) => {
          const serviceData = await this.productRepository.getDataForService(comboItem.service.code);

          const plainServiceData = JSON.parse(JSON.stringify(serviceData));

          return {
            itemType: SalesDomain.ItemType.SERVICE,
            itemId: comboItem.service.code,
            quantity: comboItem.service.applyToCar ? 1 : item.quantity,
            itemComboId: product.id,
            unitPrice: SalesDomain.getPriceForChannel(comboItem.prices[0], channelCode),
            data: plainServiceData,
          };
        }),
      );

      budgetItemsFromCombo.push(...comboItemsData);
    }

    budgetItems.push(budgetItem);
    budgetItems.push(...budgetItemsFromCombo);

    this.logger.log(`Budget items: ${JSON.stringify(budgetItems)}`);
    return budgetItems;
  }

  async getProduct(sku: string, storeId: string): Promise<Product> {
    const product = await this.productRepository.findBySkuAndStore(sku, storeId);
    // TODO: if business is tires
    const productTire = await this.productRepository.findTireBySku(sku, storeId);
    product.productTire = productTire;
    return product;
  }

  private addHoursToDate(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  private async processBudgetItems(conversation: any, storeId: string): Promise<void> {
    for (const budget of conversation.budgets) {
      if (budget.budgetItems) {
        await Promise.all(
          budget.budgetItems.map(async (budgetItem: any) => {
            if (budgetItem.itemType === SalesDomain.ItemType.PRODUCT) {
              const product = await this.getProduct(budgetItem.itemId, storeId);
              budgetItem.data = product;
            } else if (budgetItem.itemType === SalesDomain.ItemType.SERVICE) {
              const serviceData = await this.productRepository.getDataForService(budgetItem.itemId);
              budgetItem.data = serviceData;
            }
          }),
        );
      }
    }
  }

  async updateItemToConversation(userId: string, budgetId: string, budgetItemId: string, body: PatchUpdateItemDto) {
    this.logger.log('updateItemToConversation');
    const budget = await this.validateUserAndBudget(userId, budgetId);

    const updatedBudgetItems = await this.updateBudgetItems(budget, budgetItemId, body);

    if (budgetItemId.includes(SERVICES_ITEM.SECURITY_CHECK)) {
      const item = await this.budgetItemRepository.findByIdItemAndBudgetId(budgetItemId, budget.id);
      const updateItem = {
        ...item,
        quantity: body.quantity,
        isChecked: body.isChecked,
      };
      await this.budgetItemRepository.updateItem(item.id, updateItem);
    } else {
      await this.budgetRepository.updateBudgetItems({
        id: budget.id,
        budgetItems: updatedBudgetItems,
      });
    }

    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    await this.processBudgetItemsInConversation(conversation, budget.budgetGroup.store.id);

    return new ResponseConversationDto(conversation);
  }

  private async validateUserAndBudget(userId: string, budgetId: string) {
    const budget = await this.budgetRepository.findByIdAndUser(budgetId, userId);
    if (!budget) {
      throw new BadRequestException('Budget Not found');
    }

    return budget;
  }

  private async updateBudgetItems(budget, budgetItemId: string, body: PatchUpdateItemDto) {
    return await Promise.all(
      budget.budgetItems.map(async (item) => {
        if (item.itemId === budgetItemId && item.itemType === SalesDomain.ItemType.PRODUCT) {
          item.quantity = body.quantity;
          item.isChecked = body.isChecked;
        }

        if (item.itemType === SalesDomain.ItemType.SERVICE && item.itemComboId) {
          await this.updateServiceItem(item, budget, body, budgetItemId);
        } else if (item.itemType === SalesDomain.ItemType.SERVICE && item.itemId === budgetItemId) {
          if (item.isChecked == body.isChecked) {
            item.quantity = body.quantity;
          }
          item.isChecked = body.isChecked;
        }

        return item;
      }),
    );
  }

  private async updateServiceItem(item, budget, body: PatchUpdateItemDto, budgetItemId: string) {
    if (
      item.itemId === budgetItemId &&
      (Array.isArray(body.groupedIds) ? body.groupedIds.includes(item.id) : item.id === body.groupedIds)
    ) {
      if (item.isChecked == body.isChecked) {
        item.quantity = body.quantity;
      }
      item.isChecked = body.isChecked;
    } else {
      const comboId = item.itemComboId;
      const product = await this.getProduct(comboId, budget.budgetGroup.store.id);
      const service = await this.serviceRepository.findByCodeAndStore(item.itemId, budget.budgetGroup.store.id);
      const productInBudgetIt = budget.budgetItems.find((i) => i.itemId === product.id);
      item.quantity = service.applyToCar ? 1 : productInBudgetIt.quantity;
    }
  }

  private async processBudgetItemsInConversation(conversation, storeId: string) {
    await this.processBudgetItems(conversation, storeId);
  }

  async deleteItemToConversation(userId: string, budgetId: string, budgetItemId: string) {
    this.logger.log('deleteItemToConversation');
    const budget = await this.validateUserAndBudget(userId, budgetId);
    const itemIds = budgetItemId.split(',').map((id) => Number(id));
    const items = budget.budgetItems.filter((i) => itemIds.includes(i.id));

    let updatedBudgetItems = [...budget.budgetItems];
    for (const item of items) {
      if (!item.itemComboId) {
        this.logger.log(`Delete product: ${item.id}`);
        updatedBudgetItems = await this.deleteItemWithCombo(budget, item.id.toString());
      } else {
        this.logger.log(`Delete service: ${item.id}`);
        updatedBudgetItems = await this.deleteBudgetItem(budget, item.id.toString());
      }
    }
    if (updatedBudgetItems) {
      updatedBudgetItems = updatedBudgetItems.filter((item) => !itemIds.includes(item.id));
    }

    await this.budgetRepository.updateBudgetItems({
      id: budget.id,
      budgetItems: updatedBudgetItems || [],
    });

    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    await this.processBudgetItemsInConversation(conversation, budget.budgetGroup.store.id);
  }

  private async deleteBudgetItem(budget, budgetItemId: string) {
    return budget.budgetItems.filter((item) => item.id !== Number(budgetItemId));
  }

  private async deleteItemWithCombo(budget, budgetItemId: string) {
    const item = budget.budgetItems.find((i) => i.id === Number(budgetItemId));
    const comboId = item.itemId;

    const remainingProduct = budget.budgetItems.find(
      (i) => i.itemId !== comboId && i.itemType === SalesDomain.ItemType.PRODUCT,
    );

    const serviceCodes = budget.budgetItems.map((i) => i.itemId);
    const services = await this.serviceRepository.findByCodes(serviceCodes);

    if (!services) return;

    budget.budgetItems.forEach((budgetItem) => {
      const matchingService = services.find((service) => service.code === budgetItem.itemId);
      if (matchingService) {
        budgetItem.applyToCar = matchingService.applyToCar;
      }
    });

    if (remainingProduct) {
      budget.budgetItems
        .filter((i) => i.applyToCar === true && i.itemComboId === comboId)
        .forEach((service) => {
          if (!this.serviceExistsInProduct(budget, service)) {
            service.itemComboId = remainingProduct.itemId;
          }
        });
    }

    const comboItems = budget.budgetItems.filter((i) => i.itemComboId === comboId);
    return budget.budgetItems.filter((i) => i.itemId !== comboId && !comboItems.some((ci) => ci.id === i.id));
  }

  private serviceExistsInProduct(budget, service) {
    return budget.budgetItems.some((item) => item.itemId === service.itemId && item.itemComboId != service.itemComboId);
  }

  async extendConversation(userId: string, conversationId: number, extended: boolean) {
    this.logger.log('extendConversation');
    const conversation = await this.budgetGroupRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException();
    }

    const updatedConversation = await this.budgetGroupRepository.update(conversationId.toString(), {
      ...conversation,
      extended,
    });

    await this.processBudgetItems(updatedConversation, updatedConversation.store.id);

    return new ResponseConversationDto(updatedConversation);
  }

  async changeItemToConversation(userId: string, budgetId: string, itemId: string, body: PutChangeItemDto) {
    this.logger.log('changeItemToConversation');
    const isPlpDouble = await this.searchHistoryRepository.findByBudgetId(budgetId);
    if (isPlpDouble && isPlpDouble.length > 0) {
      return await this.changeItemPlpDoubleToConversation(userId, budgetId, body);
    }
    const budget = await this.validateUserAndBudget(userId, budgetId);
    const budgetItemId = budget.budgetItems.find((i) => i.itemId === itemId).id;
    await this.deleteItemToConversation(userId, budgetId, budgetItemId.toString());
    await this.addItemToConversation(
      userId,
      budgetId,
      {
        budgetItem: body.budgetItem[0],
        storeId: budget.budgetGroup.store.id,
        channel: budget.budgetGroup.channel.code,
      },
      false,
    );
    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    return new ResponseConversationDto(conversation);
  }

  async sentBudget(userId: string, budgetId: string) {
    this.logger.log('sentBudget');
    const budget = await this.validateUserAndBudget(userId, budgetId);
    await this.budgetRepository.updateBudgetSent(budget);
    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    await this.processBudgetItemsInConversation(conversation, budget.budgetGroup.store.id);

    return new ResponseConversationDto(conversation);
  }

  async transformAppointementToBudget(userId: string, budgetId: string) {
    const budget = await this.validateUserAndBudget(userId, budgetId);
    await this.budgetRepository.updateBudgetSent(budget);
    await this.cancelOtherBudgets(budgetId, budget.budgetGroup.id);
  }

  async cancelOtherBudgets(budgetId: string, conversationId: number) {
    const conversation = await this.budgetGroupRepository.findById(conversationId);
    const budgets = conversation.budgets;

    const otherBudgetIds = budgets.filter((b) => b.id !== budgetId).map((b) => b.id);

    if (otherBudgetIds.length > 0) {
      await this.budgetRepository.updateBudgetStatus(otherBudgetIds, SalesDomain.BUDGET_STATUS.CANCELLED);
    }
  }

  async createBudget(userId: string, budgetIdReference: string) {
    this.logger.log('createBudget', {
      userId,
      budgetIdReference,
    });

    const budget = await this.validateUserAndBudget(userId, budgetIdReference);

    if (!budget.sent) {
      throw new BadRequestException('Cannot create a budget from a non-sent budget');
    }

    const newBudgetId = this.generateNewBudgetId(budget);
    const newBudget = await this.createNewBudget(budget, newBudgetId);

    await this.copyBudgetItems(budget.budgetItems, newBudget);
    await this.copyBudgetNotes(budget.notes, newBudget);

    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    await this.processBudgetItemsInConversation(conversation, budget.budgetGroup.store.id);
    await this.copySegurityCheckService(budget, newBudget);

    return new ResponseConversationDto(conversation);
  }

  private async copySegurityCheckService(budget: Budget, newBudget: Budget) {
    const segurityCheckItem = budget.budgetItems.find((item) => item.itemId === this.SEGURITY_CHECK_SERVICE_CODE);
    if (!segurityCheckItem) {
      return;
    }
    const createdItems = [];
    for (const serviceItem of segurityCheckItem.budgetServicesItems) {
      const budgetSevicesItem = {
        budgetItem: segurityCheckItem,
        serviceItem: serviceItem.serviceItem,
        status: serviceItem.status,
        assignedUser: serviceItem.assignedUser ?? null,
      };
      const createdItem = await this.budgetServicesItemsRepository.create(budgetSevicesItem);

      for (const note of serviceItem.notes) {
        const newNote = await this.noteRepository.createNote({
          budgetServiceItem: createdItem,
          step: note.step,
          text: note.text,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
        });
        const createdNote = await this.noteRepository.createNote(newNote);

        if (note.files) {
          for (const file of note.files || []) {
            const meta = this.extractMinioMetaFromUrl(file.url);

            const objectKey = this.buildBudgetsObjectKey(meta, newBudget.id);
            const sourceKey = file.url.split('/').slice(1).join('/');

            await this.minioService.copyObject(sourceKey, objectKey);
            const bucket = this.minioService.getBucket();

            const createFile = await this.noteFileRepository.create({
              note: { id: createdNote.id },
              name: file.name,
              url: `${bucket}/${objectKey}`,
              type: file.type,
              createdAt: file.createdAt,
            });

            await this.noteFileRepository.create(createFile);
          }
        }
      }
      createdItems.push(createdItem);
    }
    return createdItems;
  }

  private async addSecurityCheckToBudget(budget: any, itemId: string, quantity: number = 1): Promise<any> {
    this.logger.log('addSecurityCheckToBudget');
    const securityCheckService = await this.serviceRepository.findById(itemId);
    const newBudgetItem = {
      itemType: SalesDomain.ItemType.SERVICE,
      itemId: securityCheckService.code,
      quantity: quantity,
      unitPrice: securityCheckService.price,
      isChecked: false,
      businessLineId: securityCheckService.businessLine.id,
      itemComboId: null,
      budgetId: budget.id,
    };
    budget.budgetItems.push(newBudgetItem);

    const updateBudget = await this.budgetRepository.updateBudgetItems({
      id: budget.id,
      budgetItems: budget.budgetItems,
    });

    const getServicesItems = await this.serviceItemsRepository.findAll();
    const getServiceItemStatus = await this.serviceItemsStatusesRepository.findByCode(
      SalesDomain.SERVICE_ITEM_STATUS.PENDING,
    );
    const budgetServicesItemsPromises = getServicesItems.map(async (serviceItem) => {
      const budgetServicesItem = {
        budgetItem: updateBudget.budgetItems.find((i) => i.itemId === securityCheckService.code),
        serviceItem: serviceItem,
        status: getServiceItemStatus,
        assignedUser: null,
      };
      return await this.budgetServicesItemsRepository.create(budgetServicesItem);
    });

    await Promise.all(budgetServicesItemsPromises);

    return updateBudget;
  }

  async addSecurityCheck(budget: any, body) {
    this.logger.log('addSecurityCheck');
    await this.addSecurityCheckToBudget(budget, body.budgetItem.itemId, body.budgetItem?.quantity ?? 1);

    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    await this.processBudgetItemsInConversation(conversation, budget.budgetGroup.store.id);

    return new ResponseConversationDto(conversation);
  }

  private generateNewBudgetId(budget: Budget): string {
    const budgets = budget.budgetGroup.budgets;
    const lastBudget = budgets.reduce(
      (prev, current) => (prev.createdAt > current.createdAt ? prev : current),
      budgets[0],
    );
    const lastId = parseInt(lastBudget.id.split('-')[1]);
    return `${budget.budgetGroup.id}-${lastId + 1}`;
  }

  private async createNewBudget(budget: Budget, newBudgetId: string): Promise<Budget> {
    return await this.budgetRepository.create({
      ...budget,
      notes: null,
      id: newBudgetId,
      status: { code: SalesDomain.BUDGET_STATUS.CREATING },
      sent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      budgetItems: null,
    });
  }

  private async copyBudgetItems(items: BudgetItem[], newBudget: Budget): Promise<Budget> {
    const newBudgetItems = items.map((item) => ({
      ...item,
      id: undefined,
      budgetId: newBudget.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      budgetServicesItems: item.budgetServicesItems
        ? item.budgetServicesItems.map((serviceItem) => ({
            ...serviceItem,
            id: undefined,
            budgetItemId: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        : [],
    }));

    return await this.budgetRepository.createBudgetItems(newBudget, newBudgetItems);
  }

  private async copyBudgetNotes(notes: Note[], newBudget: Budget): Promise<void> {
    if (notes && notes.length > 0) {
      await Promise.all(
        notes.map(async (element) => {
          await this.noteRepository.createNote({
            ...element,
            id: undefined,
            budget: newBudget,
          });
        }),
      );
    }
  }

  private async updateExistingProductAndServices(budget: Budget, body: PostNewItemDto): Promise<void> {
    this.logger.log('updateExistingProductAndServices');
    const existingProduct = this.findExistingProduct(budget, body);
    if (!existingProduct) {
      throw new BadRequestException('Product not found in budget');
    }

    existingProduct.quantity += body.budgetItem.quantity;

    const relatedServices = await this.getRelatedServices(budget, body);

    for (const relatedItem of relatedServices) {
      this.updateRelatedService(budget, existingProduct, relatedItem);
    }
  }

  private findExistingProduct(budget: Budget, body: PostNewItemDto): BudgetItem | undefined {
    return budget.budgetItems.find(
      (item) => item.itemId === body.budgetItem.itemId && item.itemType === SalesDomain.ItemType.PRODUCT,
    );
  }

  private async getRelatedServices(budget: Budget, body: PostNewItemDto): Promise<BudgetItem[]> {
    return this.getBudgetItemsForProduct(body.budgetItem, budget.budgetGroup.store.id, budget.budgetGroup.channel.code);
  }

  private updateRelatedService(
    budget: Budget,
    existingProduct: BudgetItem,
    relatedItem: BudgetItem & { data?: { applyToCar } },
  ): void {
    const existingService = budget.budgetItems.find(
      (i) =>
        i.itemId === relatedItem.itemId &&
        i.itemType === SalesDomain.ItemType.SERVICE &&
        i.itemComboId === existingProduct.itemId,
    );
    const applyToCar = relatedItem?.data?.applyToCar;

    if (existingService && existingProduct.itemId === relatedItem.itemComboId) {
      if (!applyToCar) {
        existingService.quantity = existingProduct.quantity;
      }
    } else if (
      relatedItem.itemType === SalesDomain.ItemType.SERVICE &&
      existingProduct.itemId === relatedItem.itemComboId
    ) {
      relatedItem.quantity = applyToCar ? 1 : existingProduct.quantity;
      budget.budgetItems.push(relatedItem);
    }
  }

  private async handleProductBudgetItems(budget: Budget, body: PostNewItemDto): Promise<BudgetItem[]> {
    this.logger.log('handleProductBudgetItems');
    const items = await this.getBudgetItemsForProduct(
      body.budgetItem,
      budget.budgetGroup.store.id,
      budget.budgetGroup.channel.code,
    );

    if (items.length === 0) {
      throw new BadRequestException('Not found product');
    }

    return items.filter(
      (item) =>
        !(
          item.itemType === SalesDomain.ItemType.SERVICE &&
          item.data?.applyToCar === true &&
          budget.budgetItems.some(
            (existingItem) =>
              existingItem.itemType === SalesDomain.ItemType.SERVICE &&
              existingItem.unitPrice === item.unitPrice &&
              existingItem.itemId === item.itemId,
          )
        ),
    );
  }

  private async handleServiceBudgetItems(body: PostNewItemDto): Promise<BudgetItem[]> {
    const service = await this.serviceRepository.findByCodeAndStore(body.budgetItem.itemId, body.storeId);
    if (!service) {
      throw new BadRequestException('Not found service');
    }

    const item = new BudgetItem();
    item.itemType = SalesDomain.ItemType.SERVICE;
    item.itemId = service.code;
    item.quantity = body.budgetItem.quantity;
    item.unitPrice = SalesDomain.getPriceForChannel(service.prices[0], body.channel);

    return [item];
  }

  private readonly filterItemsApplyToCar = (item: any, index: number, self: any[], businessLine: any) => {
    if (item.itemType === SalesDomain.ItemType.PRODUCT) {
      return true;
    }

    if (item.itemType === SalesDomain.ItemType.SERVICE && item.data?.applyToCar === false) {
      return true;
    }
    return (
      businessLine === AppDomain.BUSINESS_LINES.TIRE &&
      index ===
        self.findIndex(
          (i) =>
            i.data?.code === item.data?.code &&
            i.price === item.price &&
            i.itemType === SalesDomain.ItemType.SERVICE &&
            i.data?.applyToCar === true,
        )
    );
  };

  private updateCheckedStatusForMatchingServices(
    budgetItems: BudgetItem[],
    newBudgetItems: BudgetItem[],
  ): BudgetItem[] {
    return budgetItems.map((item) => {
      const matchingItem = newBudgetItems.find(
        (filtered) =>
          filtered.itemId === item.itemId &&
          filtered.unitPrice === item.unitPrice &&
          filtered.itemType === SalesDomain.ItemType.SERVICE,
      );
      return matchingItem ? { ...item, isChecked: false } : item;
    });
  }

  private async registerVehicleSearchCriteria(budget: Budget, body: PostConversationDto) {
    this.logger.log('registerVehicleSearchCriteria');

    if (body.searchByVehicle === false || !body.searchByVehicle) {
      return 0;
    }
    const criteria = await this.searchCriteriaRepository.findByCode(SalesDomain.SEARCH_CRITERIA.SEARCH_BY_VEHICLE);

    const searchHistory = new SearchHistory();
    searchHistory.budget = budget;
    searchHistory.workOrder = null;
    searchHistory.doublePlp = body.doublePlp || false;
    searchHistory.searchCriteria = criteria;
    searchHistory.frontProfile = body.measureDouble?.front?.profile || null;
    searchHistory.frontWidth = body.measureDouble?.front?.width || null;
    searchHistory.frontRim = body.measureDouble?.front?.rim || null;
    searchHistory.rearProfile = body.measureDouble?.rear?.profile || null;
    searchHistory.rearWidth = body.measureDouble?.rear?.width || null;
    searchHistory.rearRim = body.measureDouble?.rear?.rim || null;

    await this.searchHistoryRepository.save(searchHistory);
  }

  private async changeItemPlpDoubleToConversation(userId: string, budgetId: string, body: any) {
    this.logger.log('changeItemPlpDoubleToConversation');

    const budget = await this.validateUserAndBudget(userId, budgetId);
    const products = budget.budgetItems.filter(
      (i) => i.itemType === SalesDomain.ItemType.PRODUCT && i.businessLineId == AppDomain.BUSINESS_LINES.TIRE,
    );

    if (!budget && !products) {
      throw new BadRequestException('Budget or products not found');
    }

    await this.removeProductsFromBudget(budget, products);
    await this.addProductsToConversation(userId, budgetId, body.budgetItem, budget);
    const conversation = await this.budgetGroupRepository.findById(budget.budgetGroup.id);
    return new ResponseConversationDto(conversation);
  }

  private async removeProductsFromBudget(budget: any, products: any[]) {
    for (const product of products) {
      const currentProduct = budget.budgetItems.find((i) => i.id === product.id);
      if (currentProduct) {
        budget.budgetItems = await this.deleteItemWithCombo(budget, currentProduct.id.toString());
        await this.budgetRepository.updateBudgetItems(budget);
      }
    }
    return budget.budgetItems;
  }

  private async addProductsToConversation(userId: string, budgetId: string, budgetItems: any[], budget: any) {
    for (const productId of budgetItems) {
      await this.addItemToConversation(
        userId,
        budgetId,
        {
          budgetItem: productId,
          storeId: budget.budgetGroup.store.id,
          channel: budget.budgetGroup.channel.code,
        },
        false,
      );
    }
  }

  private validateProductAddition(budget: Budget, body: PostNewItemDto): void {
    const existingBudgetItems = budget.budgetItems.filter((item) => item.itemType === SalesDomain.ItemType.PRODUCT);
    const uniqueProductIds = new Set(
      existingBudgetItems
        .filter((item) => item.businessLineId === AppDomain.BUSINESS_LINES.TIRE)
        .map((item) => item.itemId),
    );

    if (!uniqueProductIds.has(body.budgetItem.itemId) && uniqueProductIds.size >= 2) {
      throw new BadRequestException('You can only add two different products.');
    }
  }

  private extractMinioMetaFromUrl(url: string) {
    const parts = url.split('/');
    if (parts.length < 11) throw new Error('URL inválida');

    return {
      storeId: parts[2],
      year: parts[5],
      month: parts[6],
      day: parts[7],
      userId: parts[8],
      typeId: parts[9],
      fileName: parts[10],
    };
  }

  private buildBudgetsObjectKey(meta: any, budgetId: string | number): string {
    const { storeId, year, month, day, userId, fileName } = meta;
    const type = this.TYPE_BUDGETS;
    return `uploads/${storeId}/notes/${type}/${year}/${month}/${day}/${userId}/${budgetId}/${fileName}`;
  }
}
