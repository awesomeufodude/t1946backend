import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Product } from 'src/infrastructure/database/entities/product.entity';
import { WorkorderItemStatus } from 'src/infrastructure/database/entities/workorder-item-statuses.entity';
import { WorkorderItem } from 'src/infrastructure/database/entities/workorder-items.entity';
import { Workorder } from 'src/infrastructure/database/entities/workorder.entity';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository';
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { ServiceRepository } from 'src/infrastructure/database/repositories/service.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { VehicleCustomerRepository } from 'src/infrastructure/database/repositories/vehicle-customer.repository';
import { WorkorderItemRecordRepository } from 'src/infrastructure/database/repositories/workorder-item-record.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { BudgetsService } from '../budgets/budgets.service';
import { CreateWorkorderItemDto } from './create-workorder-items.dto';
import { CreateWorkorderDto } from './create-workorder.dto';
import { PostNewItemDto, WorkOrderItemRequestDto } from './request-workorder.dto';
import { ResponseWorkorderDto } from './response-workorder.dto';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { ServiceItemsRepository } from 'src/infrastructure/database/repositories/service-items.repository';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { SERVICES_ITEM } from 'src/modules/common/constants';
import { UpdateStatusDto } from './workorders.dto';
import { CoreDtos } from 'src/shared/dtos/core.dto';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';
@Injectable()
export class WorkordersService {
  private readonly TIME_ZERO = 'T00:00:00';
  private readonly APPLY_TO_CAR_TRUE = true;
  private readonly TYPE_WORKORDERS = 'workorders';

  constructor(
    private readonly logger: Logger,
    private readonly workorderRepository: WorkorderRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly noteRepository: NoteRepository,
    private readonly budgetService: BudgetsService,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly vehiclecustomerRepository: VehicleCustomerRepository,
    private readonly roleRepository: RoleRepository,
    private readonly workorderItemRecordRepository: WorkorderItemRecordRepository,
    private readonly vehicleRepository: VehiclesRepository,
    private readonly workOrderServicesItemsRepository: WorkorderServicesItemsRepository,
    private readonly serviceItemsRepository: ServiceItemsRepository,
    private readonly serviceItemsStatusesRepository: ServiceItemsStatusesRepository,
    private readonly minioService: MinioService,
    private readonly noteFileRepository: NoteFileRepository,
  ) {}

  async findByUserAndDate(userId: string, date: string, storeId: any, role?: string) {
    this.logger.log('findByUserAndDate');
    const formattedDate = new Date(date + this.TIME_ZERO);
    const roleType = await this.roleRepository.findById(role);
    const workorders =
      roleType?.name === AppDomain.Roles.MAESTRO
        ? await this.workorderRepository.findWorkOrdersByUserAssigned(userId, formattedDate, storeId)
        : await this.workorderRepository.findActivesByUserAndDate(userId, formattedDate, storeId);
    return workorders.map((workorder) => new ResponseWorkorderDto(workorder));
  }

  async findByUserAndDateReassigned(userId: string, date: string, storeId: any) {
    this.logger.log('findByUserAndDateReassigned');
    const formattedDate = new Date(date + this.TIME_ZERO);
    const workorders = await this.workorderRepository.findActivesByUserAndDateReassigned(
      userId,
      formattedDate,
      storeId,
    );
    return workorders.map((workorder) => new ResponseWorkorderDto(workorder));
  }

  async createWorkorder(data: any): Promise<any> {
    this.logger.log('createWorkorder', data);
    const budget = await this.budgetRepository.findById(data.budgetId);

    if (!budget) {
      throw new Error('Budget not found');
    }

    if (budget.budgetGroup.sent === false) {
      await this.budgetService.sentBudget(data.createdBy, data.budgetId);
    }

    await this.budgetService.updateBudgetStatus(data.budgetId, SalesDomain.BUDGET_STATUS.APPROVED);

    if (budget.budgetGroup.budgets.length > 1) {
      await this.budgetService.cancelOtherBudgets(budget.id, budget.budgetGroup.id);
    }

    const workorderDto = new CreateWorkorderDto(data, budget);
    const workorder = await this.workorderRepository.create(workorderDto);
    if (budget.budgetGroup.vehicle && budget.budgetGroup.customer) {
      await this.vehiclecustomerRepository.save(budget.budgetGroup.vehicle.id, budget.budgetGroup.customer.id);
      await this.actualizeVehicleOdometerDate(budget.budgetGroup.vehicle.id, workorder.createdAt);
    }
    const workorderItems = await this.createWorkorderItem(budget.budgetItems, workorder.id);
    this.addNotesToWorkorder(budget.notes, workorder.id);
    const workorderItem = workorderItems.find((item) => item.itemId === SERVICES_ITEM.SECURITY_CHECK);
    const itemSecurityCheck = budget.budgetItems?.find((item) => item.itemId === SERVICES_ITEM.SECURITY_CHECK);

    if (itemSecurityCheck && workorderItem) {
      await this.addSecurityCheckToWorkOrder(itemSecurityCheck, workorderItem, workorder.id);
    }
    return new ResponseWorkorderDto(workorder);
  }

  async actualizeVehicleOdometerDate(vehicleId: string, date: Date) {
    this.logger.log('actualizeVehicleOdometerDate');
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }
    vehicle.odometerUpdateDate = date;
    await this.vehicleRepository.update(vehicle.id, vehicle);
  }

  async createWorkorderItem(items: any[], workorderId): Promise<any> {
    this.logger.log('createWorkorderItem', JSON.stringify(items));

    const createdItems = [];

    for (const item of items) {
      const workorderItemDto = new CreateWorkorderItemDto(item, workorderId);
      const createdItem = await this.workorderRepository.createWorkorderItem(workorderItemDto);
      createdItems.push(createdItem);
    }
    return createdItems;
  }

  private addNotesToWorkorder(notes: any[], workorderId) {
    for (const note of notes) {
      note.workorder = workorderId;
      this.noteRepository.updateNoteById(note.id, note);
    }
  }

  private async addSecurityCheckToWorkOrder(workOrderServiceItems, workorderItem: WorkorderItem, workorderId: number) {
    const createdItems = [];
    for (const serviceItem of workOrderServiceItems.budgetServicesItems) {
      const workOrderServicesItem = {
        workorderItem: workorderItem,
        serviceItem: serviceItem.serviceItem,
        status: serviceItem.status,
        assignedUser: serviceItem.assignedUser ?? null,
      };
      const createdItem = await this.workOrderServicesItemsRepository.create(workOrderServicesItem);

      for (const note of serviceItem.notes || []) {
        const createNote = await this.noteRepository.create({
          workorderServiceItem: {
            id: createdItem.id,
          },
          step: note.step,
          text: note.text,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
        });
        const createdNote = await this.noteRepository.createNote(createNote);

        if (note.files) {
          for (const file of note.files || []) {
            const meta = this.extractMinioMetaFromUrl(file.url);

            const objectKey = this.buildWorkorderObjectKey(meta, workorderId);
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

  async findById(userId: string, workorderId: number, role: string, storeId?: string, searchMode?: string) {
    const roleName = await this.roleRepository.findById(role);
    let workorder = null;
    const search = JSON.parse(searchMode);

    switch (roleName.name) {
      case AppDomain.Roles.ADMIN:
        workorder = await this.workorderRepository.findById(workorderId);
        break;
      case AppDomain.Roles.JEFE_DE_SERVICIO:
        workorder = search
          ? await this.workorderRepository.findById(workorderId)
          : await this.workorderRepository.findByIdAndCreatedByAndStore(workorderId, userId, storeId);
        break;
      case AppDomain.Roles.MAESTRO:
      case AppDomain.Roles.MAESTRO_ALINEADOR:
        workorder = await this.workorderRepository.findByIdAndStore(workorderId, storeId);
        break;
    }

    if (!workorder) {
      throw new NotFoundException('Workorder not found');
    }

    await this.processWorkorderItems(workorder.workOrderItems, workorder.budget.budgetGroup.store.id);
    return new ResponseWorkorderDto(workorder);
  }

  private async processWorkorderItems(workOrderItems: any[], storeId: string) {
    await Promise.all(
      workOrderItems.map(async (workOrderItem: any) => {
        if (workOrderItem.itemType === SalesDomain.ItemType.PRODUCT) {
          const product = await this.budgetService.getProduct(workOrderItem.itemId, storeId);
          workOrderItem.data = product;
        } else if (workOrderItem.itemType === SalesDomain.ItemType.SERVICE) {
          const serviceData = await this.productRepository.getDataForService(workOrderItem.itemId);
          workOrderItem.data = serviceData;
        }
      }),
    );
  }

  async deleteWorkOrderItem(userId: string, workOrderId: number, workOrderItemId: string) {
    this.logger.log('deleteItemToConversation');
    const workOrder = await this.validateUserAndWorkOrder(userId, workOrderId);
    const itemIds = workOrderItemId.split(',').map((id) => Number(id));
    const items = workOrder.workOrderItems.filter((i) => itemIds.includes(i.id));
    let updatedWorkOrderItems = [...workOrder.workOrderItems];

    for (const item of items) {
      if (item.itemType === SalesDomain.ItemType.PRODUCT) {
        this.logger.log(`Delete product: ${item.id}`);
        updatedWorkOrderItems = await this.deleteItemWithCombo(workOrder, item.id.toString());
      } else {
        this.logger.log(`Delete service: ${item.id}`);
        updatedWorkOrderItems = await this.deleteItem(workOrder, item.id.toString());
      }
    }
    if (updatedWorkOrderItems) {
      updatedWorkOrderItems = updatedWorkOrderItems.filter((item) => !itemIds.includes(item.id));
    }

    await this.workorderRepository.updateWorkOrderItems({
      id: workOrder.id,
      workOrderItems: updatedWorkOrderItems || [],
    });
  }

  private async validateUserAndWorkOrder(userId: string, workOrderId: number) {
    const workOrder = await this.workorderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new BadRequestException('WorkOrder Not found');
    }
    if (workOrder.createdBy.id !== userId) {
      throw new ForbiddenException();
    }
    return workOrder;
  }

  private async deleteItemWithCombo(workOrder, workOrderItemId: string) {
    const item = workOrder.workOrderItems.find((i) => i.id === Number(workOrderItemId));
    if (!item) return workOrder.workOrderItems;

    const comboId = item.itemId;

    const remainingProduct = workOrder.workOrderItems.find(
      (i) => i.itemId !== comboId && i.itemType === SalesDomain.ItemType.PRODUCT,
    );

    const serviceCodes = workOrder.workOrderItems.map((i) => i.itemId);
    const services = await this.serviceRepository.findByCodes(serviceCodes);

    if (!services) return workOrder.workOrderItems;

    workOrder.workOrderItems.forEach((workOrderItem) => {
      const matchingService = services.find((service) => service.code == workOrderItem.itemId);
      if (matchingService) {
        workOrderItem.applyToCar = matchingService.applyToCar;
      }
    });

    if (remainingProduct) {
      workOrder.workOrderItems
        .filter((i) => i.applyToCar == this.APPLY_TO_CAR_TRUE && i.itemComboId == comboId)
        .forEach((service) => {
          if (!this.serviceExistsInProduct(workOrder, service)) {
            service.itemComboId = remainingProduct.itemId;
          }
        });
    }

    const comboItems = workOrder.workOrderItems.filter((i) => i.itemComboId === comboId);
    return workOrder.workOrderItems.filter((i) => i.itemId !== comboId && !comboItems.some((ci) => ci.id === i.id));
  }

  private serviceExistsInProduct(workOrder, service) {
    return workOrder.workOrderItems.some(
      (item) => item.itemId === service.itemId && item.itemComboId != service.itemComboId,
    );
  }

  private async deleteItem(workOrderItems, workOrderItemId: string) {
    return workOrderItems.workOrderItems.filter((item) => item.id != Number(workOrderItemId));
  }

  async updateWorkOrderItemTechnician(
    userId: string,
    workOrderId: number,
    workOrderitemId: string,
    technicianId: string,
  ) {
    this.logger.log('updateWorkOrderItemTechnician');

    const workOrderItemIds = workOrderitemId.split(',').map((id) => id.trim());
    if (workOrderItemIds.length === 0) {
      throw new BadRequestException('No valid workOrderItem IDs provided');
    }

    const workOrder = await this.validateUserAndWorkOrder(userId, workOrderId);
    if (!workOrder) {
      throw new BadRequestException('WorkOrder not found');
    }

    for (const itemId of workOrderItemIds) {
      await this.updateWorkOrderItemAssigned(workOrder, Number(itemId), technicianId);
    }
    await this.workorderRepository.updateWorkOrderItems({
      id: workOrder.id,
      workOrderItems: workOrder.workOrderItems,
    });

    return new ResponseWorkorderDto(workOrder);
  }

  private async updateWorkOrderItemAssigned(workOrder: any, workOrderItemId: number, technicianId: string) {
    for (const item of workOrder.workOrderItems) {
      if (item.id == workOrderItemId) {
        const user = await this.validateUser(technicianId);
        item.userAssigned = user;
        item.itemStatus = SalesDomain.WORKORDERS_ITEMS_STATUS.ASSIGNED;
        return;
      }
    }

    throw new BadRequestException('Item not found in work order');
  }

  private async validateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async reassignWorkOrder(userId: string, reassignUserId: string, workOrderId: string) {
    this.logger.log('reassignWorkOrder');

    const workOrderIds = workOrderId.includes('-') ? workOrderId.split('-') : [workOrderId];

    const workOrders = [];
    for (const id of workOrderIds) {
      const workOrder = await this.validateUserAndWorkOrder(userId, Number(id));
      workOrders.push(workOrder);
    }

    const user = await this.validateUser(reassignUserId);

    for (const workOrder of workOrders) {
      workOrder.reassignedTo = user;
      workOrder.reassigned = true;
      await this.workorderRepository.updateWorkOrder(workOrder);
    }

    return workOrders.map((workOrder) => new ResponseWorkorderDto(workOrder));
  }

  async addItemToWorkOrder(userId: string, body: any, workOrderId: any): Promise<any> {
    this.logger.log('addItemToWorkOrder', body);
    const workOrder = await this.workorderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new BadRequestException('Not found workorder');
    }
    if (workOrder.budget.budgetGroup.createdBy.id !== userId) {
      throw new ForbiddenException();
    }

    if (body.workOrderItem.itemType === SalesDomain.ItemType.SERVICE) {
      const response = this.addSecurityCheck(workOrder, body);
      return response;
    }

    const existingWorkOrderItems = workOrder.workOrderItems.filter(
      (item) => item.itemType === SalesDomain.ItemType.PRODUCT,
    );

    if (existingWorkOrderItems.length > 0) {
      const uniqueProductIds = new Set(
        existingWorkOrderItems
          .filter((item) => item.businessLineId == AppDomain.BUSINESS_LINES.TIRE)
          .map((item) => item.itemId),
      );
      if (!uniqueProductIds.has(body.workOrderItem.itemId) && uniqueProductIds.size >= 2) {
        throw new BadRequestException('You can only add two different products.');
      }
    }
    const productExists = workOrder.workOrderItems.some(
      (item) => item.itemId === body.workOrderItem.itemId && item.itemType === SalesDomain.ItemType.PRODUCT,
    );
    if (productExists) {
      await this.updateExistingProductAndServices(workOrder, body);
    } else {
      const newWorkOrderItems =
        body.workOrderItem.itemType === SalesDomain.ItemType.PRODUCT
          ? await this.handleProductWorkOrderItem(body.workOrderItem, workOrder, workOrderId)
          : [await this.handleServiceWorkOrderItem(body)];

      workOrder.workOrderItems.push(...newWorkOrderItems);
    }

    await this.workorderRepository.updateWorkOrderItems({
      id: workOrder.id,
      workOrderItems: workOrder.workOrderItems,
    });
    const conversation = await this.workorderRepository.findById(workOrder.id);
    return new ResponseWorkorderDto(conversation);
  }

  private async updateExistingProductAndServices(workorder: Workorder, body: PostNewItemDto): Promise<void> {
    this.logger.log('updateExistingProductAndServices', body);

    const existingProduct = this.findExistingProduct(workorder, body.workOrderItem.itemId);

    if (!existingProduct) {
      throw new BadRequestException('Product not found in workorder');
    }

    existingProduct.quantity += body.workOrderItem.quantity;

    const relatedServices = await this.getRelatedServices(body, workorder);

    for (const relatedItem of relatedServices) {
      this.updateOrAddRelatedService(workorder, existingProduct, relatedItem);
    }
  }

  private findExistingProduct(workorder: Workorder, itemId: string): WorkorderItem | undefined {
    return workorder.workOrderItems.find(
      (item) => item.itemId === itemId && item.itemType === SalesDomain.ItemType.PRODUCT,
    );
  }

  private async getRelatedServices(body: PostNewItemDto, workorder: Workorder): Promise<WorkorderItem[]> {
    return await this.getWorkOrderItemsForProduct(
      body.workOrderItem,
      workorder.budget.budgetGroup.store.id,
      workorder.budget.budgetGroup.channel.code,
      body.workOrderId,
    );
  }

  private updateOrAddRelatedService(
    workorder: Workorder,
    existingProduct: WorkorderItem,
    relatedItem: WorkorderItem & { data?: { applyToCar } },
  ): void {
    const existingService = workorder.workOrderItems.find(
      (item) =>
        item.itemId === relatedItem.itemId &&
        item.itemType === SalesDomain.ItemType.SERVICE &&
        item.itemComboId === existingProduct.itemId,
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
      workorder.workOrderItems.push(relatedItem);
    }
  }

  private async getWorkOrderItemsForProduct(
    item: WorkOrderItemRequestDto,
    storeId: string,
    channelCode: string,
    workOrderId: string,
  ): Promise<any[]> {
    const workOrderItems = [];
    const budgetItemsFromCombo = [];
    this.logger.log(`Item: ${JSON.stringify(item)}`);
    const product = await this.getProduct(item.itemId, storeId);
    this.logger.log(`Product: ${JSON.stringify(product)}`);

    const workOrderItem = {
      workorder: workOrderId,
      itemType: item.itemType,
      itemId: product.id,
      unitPrice: SalesDomain.getPriceForChannel(product.productPrices[0], channelCode),
      quantity: item.quantity,
      total: item.quantity * SalesDomain.getPriceForChannel(product.productPrices[0], channelCode),
      itemComboId: item.itemId,
      businessLineId: product.businessLine.id,
      itemStatus: SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING,
      data: null,
    };

    const combo = await this.productRepository.getProductCombo(storeId, product.productTire.rim);

    if (combo) {
      const comboItemsData = await Promise.all(
        combo.comboItems.map(async (comboItem) => {
          const serviceData = await this.productRepository.getDataForService(comboItem.service.code);
          const plainServiceData = JSON.parse(JSON.stringify(serviceData));
          return {
            workorder: workOrderId,
            itemType: SalesDomain.ItemType.SERVICE,
            itemId: comboItem.service.code,
            quantity: comboItem.service.applyToCar ? 1 : item.quantity,
            total: item.quantity * SalesDomain.getPriceForChannel(product.productPrices[0], channelCode),
            itemComboId: product.id,
            unitPrice: SalesDomain.getPriceForChannel(comboItem.prices[0], channelCode),
            data: plainServiceData,
            businessLineId: product.businessLine.id,
            itemStatus: SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING,
          };
        }),
      );

      budgetItemsFromCombo.push(...comboItemsData);
    }

    workOrderItems.push(workOrderItem);
    workOrderItems.push(...budgetItemsFromCombo);

    return workOrderItems;
  }

  async getProduct(sku: string, storeId: string): Promise<Product> {
    const product = await this.productRepository.findBySkuAndStore(sku, storeId);
    const productTire = await this.productRepository.findTireBySku(sku, storeId);
    product.productTire = productTire;
    return product;
  }

  async changeItemToWorkOrder(userId: string, workOrderId: string, itemId: number, body: any) {
    this.logger.log('changeItemToConversation');
    const workOrder = await this.validateUserAndWorkOrder(userId, Number(workOrderId));
    const workOrderItem = workOrder.workOrderItems.find((i) => i.id == itemId)?.id;

    if (!workOrderItem) {
      throw new BadRequestException('Item not found');
    }

    await this.deleteWorkOrderItem(userId, Number(workOrderId), workOrderItem.toString());
    await this.addItemToWorkOrder(userId, body, Number(workOrderId));
    const conversation = await this.workorderRepository.findById(workOrder.id);
    return new ResponseWorkorderDto(conversation);
  }

  private async handleProductWorkOrderItem(
    workOrderItem: any,
    workOrder: Workorder,
    workOrderId: string,
  ): Promise<WorkorderItem[]> {
    const items = await this.getWorkOrderItemsForProduct(
      workOrderItem,
      workOrder.budget.budgetGroup.store.id,
      workOrder.budget.budgetGroup.channel.code,
      workOrderId,
    );

    if (items.length === 0) {
      throw new BadRequestException('Not found product');
    }

    const filteredItems = items.filter(
      (item) =>
        !(
          item.itemType === SalesDomain.ItemType.SERVICE &&
          item.data?.applyToCar == this.APPLY_TO_CAR_TRUE &&
          workOrder.workOrderItems.some(
            (existingItem) =>
              existingItem.itemType === SalesDomain.ItemType.SERVICE &&
              existingItem.unitPrice == item.unitPrice &&
              existingItem.itemId == item.itemId,
          )
        ),
    );
    return filteredItems;
  }

  private async handleServiceWorkOrderItem(body: any): Promise<WorkorderItem> {
    const service = await this.serviceRepository.findByCodeAndStore(body.workOrderItem.itemId, body.storeId);
    if (!service) {
      throw new BadRequestException('Not found service');
    }

    const item = new WorkorderItem();
    item.workorder = body.workOrderId;
    item.itemType = SalesDomain.ItemType.SERVICE;
    item.itemId = service.code;
    item.quantity = body.workOrderItem.quantity;
    item.unitPrice = SalesDomain.getPriceForChannel(service.prices[0], body.channel);
    item.total = item.quantity * item.unitPrice;
    item.itemComboId = body.workOrderItem.itemComboId;
    item.itemStatus = SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING as unknown as WorkorderItemStatus;

    return item;
  }

  async startOrFinishRecordTime(userId: string, workOrderId: string, workOrderItemId: string, action: string) {
    this.logger.log('startOrFinishRecordTime');

    if (action === AppDomain.RECORD_TIME_TYPES.START) {
      await this.createWorkOrderItemRecord(userId, workOrderId, workOrderItemId);
      await this.changeWorkOrderItemStatus(workOrderItemId, SalesDomain.WORKORDERS_ITEMS_STATUS.IN_PROGRESS);
    } else {
      await this.finishWorkOrderItemRecord(userId, workOrderId, workOrderItemId);
      if (action === AppDomain.RECORD_TIME_TYPES.PAUSE) {
        await this.changeWorkOrderItemStatus(workOrderItemId, SalesDomain.WORKORDERS_ITEMS_STATUS.PAUSED);
      }
    }

    const workOrder = await this.workorderRepository.findById(Number(workOrderId));
    await this.processWorkorderItems(workOrder.workOrderItems, workOrder.budget.budgetGroup.store.id);
    return new ResponseWorkorderDto(workOrder);
  }

  private async createWorkOrderItemRecord(userId: string, workOrderId: string, workOrderItemId: string) {
    const workOrderItem = await this.workorderRepository.findWorkOrderItemById(Number(workOrderItemId));
    if (!workOrderItem) {
      throw new BadRequestException('WorkOrderItem not found');
    }

    await this.workorderItemRecordRepository.createWorkOrderItemRecord(userId, workOrderId, workOrderItemId);
  }

  private async finishWorkOrderItemRecord(userId: string, workOrderId: string, workOrderItemId: string) {
    const workOrderItemRecord = await this.workorderItemRecordRepository.findWorkOrderItemRecordByWorkOrderItemId(
      Number(workOrderItemId),
    );

    if (workOrderItemRecord) {
      const recordNotFinished = workOrderItemRecord.find((record) => !record.endTime);

      if (recordNotFinished) {
        await this.workorderItemRecordRepository.finishWorkOrderItemRecord(recordNotFinished.id);
      }
    }
  }

  private async changeWorkOrderItemStatus(workOrderItemId: string, status: string) {
    const workOrderItem = await this.workorderRepository.findWorkOrderItemById(Number(workOrderItemId));
    if (!workOrderItem) {
      throw new BadRequestException('WorkOrderItem not found');
    }

    const sameWorkOrderItems = workOrderItem.workorder?.workOrderItems.filter(
      (item) => item.itemId == workOrderItem.itemId && item.unitPrice == workOrderItem.unitPrice,
    );

    for (const item of sameWorkOrderItems) {
      item.itemStatus = status as unknown as WorkorderItemStatus;
      await this.workorderRepository.updateWorkOrderItem(item);
    }
  }

  async finishWorkOrderItem(userId: string, workOrderId: string, workOrderItemId: string, done: boolean) {
    this.logger.log('finishWorkOrderItem');

    if (done) {
      await this.changeWorkOrderItemStatus(workOrderItemId, SalesDomain.WORKORDERS_ITEMS_STATUS.COMPLETED);
    }

    const workOrder = await this.workorderRepository.findById(Number(workOrderId));
    await this.processWorkorderItems(workOrder.workOrderItems, workOrder.budget.budgetGroup.store.id);
    return new ResponseWorkorderDto(workOrder);
  }

  private async addSecurityCheck(workOrder: any, body: any) {
    this.logger.log('addSecurityCheck');
    const securityCheckService = await this.serviceRepository.findById(body.workOrderItem.itemId);

    const newWorkOrderItem = {
      itemType: SalesDomain.ItemType.SERVICE,
      itemId: securityCheckService.code,
      quantity: body.workOrderItem.quantity,
      unitPrice: securityCheckService.price,
      isChecked: false,
      businessLineId: securityCheckService.businessLine.id,
      itemComboId: null,
      workorderId: workOrder.id,
      itemStatus: SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING,
    };
    workOrder.workOrderItems.push(newWorkOrderItem);

    const updateWorkOrder = await this.workorderRepository.updateWorkOrderItems({
      id: workOrder.id,
      workOrderItems: workOrder.workOrderItems,
    });

    const getServicesItems = await this.serviceItemsRepository.findAll();
    const getServiceItemStatus = await this.serviceItemsStatusesRepository.findByCode(
      SalesDomain.SERVICE_ITEM_STATUS.PENDING,
    );

    const workOrderServicesItemsPromises = getServicesItems.map(async (serviceItem) => {
      const workOrderServicesItem = {
        workorderItem: updateWorkOrder.workOrderItems.find((i) => i.itemId === securityCheckService.code),
        serviceItem: serviceItem,
        status: getServiceItemStatus,
        assignedUser: null,
      };
      return await this.workOrderServicesItemsRepository.create(workOrderServicesItem);
    });

    await Promise.all(workOrderServicesItemsPromises);

    const conversation = await this.workorderRepository.findById(workOrder.id);

    return new ResponseWorkorderDto(conversation);
  }

  async updateStatusServiceWorkOrder(body: UpdateStatusDto, userId: string) {
    this.logger.log('updateStatusServiceWorkOrder');
    const serviceItem = await this.workOrderServicesItemsRepository.findById(body.workOrderServiceItemId);
    if (!serviceItem) {
      throw new NotFoundException();
    }
    if (serviceItem.status.code != SalesDomain.SERVICE_ITEM_STATUS.PENDING) {
      throw new BadRequestException('The status of the service item is not pending');
    }

    const response = await this.workOrderServicesItemsRepository.updateStatus(
      body.workOrderServiceItemId,
      body.status,
      userId,
    );
    return new CoreDtos.UpdateStatusServiceItemDto(response);
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

  private buildWorkorderObjectKey(meta: any, workOrderId: string | number): string {
    const { storeId, year, month, day, userId, fileName } = meta;
    const type = this.TYPE_WORKORDERS;

    return `uploads/${storeId}/notes/${type}/${year}/${month}/${day}/${userId}/${workOrderId}/${fileName}`;
  }
}
