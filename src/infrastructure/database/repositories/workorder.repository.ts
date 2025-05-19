import { Inject, Injectable, Logger } from '@nestjs/common';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { WorkorderItemRecord } from '../entities/workorder-item-records.entity';
import { WorkorderItem } from '../entities/workorder-items.entity';
import { Workorder } from '../entities/workorder.entity';
import { AbstractRepository } from './abstract.repository';
import { WorkorderServicesItems } from '../entities/workorder-services-items';
import { SERVICES_ITEM } from 'src/modules/common/constants';

@Injectable()
export class WorkorderRepository extends AbstractRepository<Workorder> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Workorder));
  }

  async findActivesByUserAndDate(userId: string, date: Date, storeId: any) {
    this.logger.log('findActivesByUserAndDate', date);
    return this.repository.find({
      where: [
        {
          createdBy: { id: userId },
          reassigned: false,
          status: Not(In([SalesDomain.WORKORDERS_STATUS.ABORTED, SalesDomain.WORKORDERS_STATUS.HISTORICAL])),
          store: { id: storeId },
        },
      ],
      order: { deliveryTime: 'ASC' },
      relations: ['workOrderItems', 'workOrderItems.itemStatus'],
    });
  }

  async findWorkOrdersByUserAssigned(userId: string, date: Date, storeId: any) {
    this.logger.log('findWorkOrdersByUser');
    return this.repository.find({
      where: [
        {
          workOrderItems: {
            userAssigned: { id: userId },
          },
          reassigned: false,
          status: Not(In([SalesDomain.WORKORDERS_STATUS.ABORTED, SalesDomain.WORKORDERS_STATUS.HISTORICAL])),
          store: { id: storeId },
        },
      ],
      order: { deliveryTime: 'ASC' },
      relations: ['workOrderItems', 'workOrderItems.itemStatus'],
    });
  }

  async findActivesByUserAndDateReassigned(userId: string, date: Date, storeId: any) {
    this.logger.log('findActivesByUserAndDateReassigned', date);
    return this.repository.find({
      where: [
        {
          reassigned: true,
          reassignedTo: { id: userId },
          status: Not(In([SalesDomain.WORKORDERS_STATUS.ABORTED, SalesDomain.WORKORDERS_STATUS.HISTORICAL])),
          store: { id: storeId },
        },
      ],
      order: { deliveryTime: 'ASC' },
      relations: ['workOrderItems', 'workOrderItems.itemStatus'],
    });
  }

  async create(data: any) {
    this.logger.log('create');
    const workOrder = await this.repository.save(data);
    return this.findById(workOrder.id);
  }

  async createWorkorderItem(data: any) {
    this.logger.log('createWorkorderItem');
    return this.repository.manager.save(WorkorderItem, data);
  }

  async findById(id: number) {
    this.logger.log('findById');
    return this.repository.findOne({
      where: { id },
      relations: this.RELATION_WORKORDER,
    });
  }

  async findByIdAndCreatedByAndStore(id: number, userId: string, storeId: string) {
    this.logger.log('findByIdAndUserCreated');
    return this.repository.findOne({
      where: { id, createdBy: { id: userId }, store: { id: storeId } },
      relations: this.RELATION_WORKORDER,
      order: {
        workOrderItems: {
          workorderServicesItems: {
            serviceItem: {
              order: 'ASC',
            },
          },
        },
      },
    });
  }

  async findByIdAndStore(id: number, storeId: string) {
    this.logger.log('findByIdAndStore');
    return this.repository.findOne({
      where: { id, store: { id: storeId } },
      relations: this.RELATION_WORKORDER,
    });
  }

  async findByIdAndStoreAndUserAssigned(id: number, storeId: string, userId: string) {
    this.logger.log('findByIdAndStoreAndUserAssigned');
    const workorder = await this.findByIdAndStore(id, storeId);
    if (!workorder) {
      return null;
    }

    if (
      workorder.workOrderItems.some((item) => item.userAssigned?.id === userId || workorder.reassignedTo?.id === userId)
    ) {
      return workorder;
    }

    return null;
  }

  async updateWorkOrderItems(workorder: Partial<Workorder>) {
    this.logger.log('updateWorkOrderItems', workorder.id);
    await this.repository.manager.transaction(async (em) => {
      await em.delete(WorkorderItemRecord, { workorder: { id: workorder.id } });
      await em.delete(WorkorderItem, { workorder });
      const newWorkOrderItems = await this.createWorkOrderItemsList(em, workorder.id, workorder.workOrderItems);

      await this.calculateAndUpdateWorkOrder(em, workorder.id, newWorkOrderItems);
    });
    return this.findById(workorder.id);
  }

  public async findWorkOrderByVehicle(vehicle: Vehicle) {
    this.logger.log('findWorkOrderByVehicle', vehicle);
    return this.repository.find({
      where: {
        vehicle: {
          id: vehicle.id,
        },
      },
      relations: [
        'workOrderItems',
        'workOrderItems.itemStatus',
        'vehicle.vehicleCatalog.brand',
        'vehicle.vehicleCatalog.model',
        'vehicle.vehicleCatalog.version',
        'budget',
        'budget.budgetGroup.store',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  private async createWorkOrderItemsList(
    em: EntityManager,
    workOrderId: number,
    items: Partial<WorkorderItem>[],
  ): Promise<WorkorderItem[]> {
    const newWorkOrderItems = [];

    for (const item of items) {
      const newItem = await em.save(WorkorderItem, {
        workorder: { id: workOrderId },
        ...item,
      });
      const workorderServicesItems = [];
      if (item.workorderServicesItems?.length) {
        for (const workorderServicesItem of item.workorderServicesItems) {
          const newBudgetServicesItem = await em.save(WorkorderServicesItems, {
            workorderItem: { id: newItem.id },
            ...workorderServicesItem,
          });
          workorderServicesItems.push(newBudgetServicesItem);
        }
      }

      newItem.workorderServicesItems = workorderServicesItems;
      newWorkOrderItems.push(newItem);
    }
    return newWorkOrderItems;
  }

  private calculateAndUpdateWorkOrder(em: EntityManager, workOrderId: number, workOrderItems: WorkorderItem[]) {
    const { subTotal, taxes, total } = this.calculateWorkOrder(workOrderItems);
    return em.update(
      Workorder,
      { id: workOrderId },
      {
        total,
        subTotal,
        iva: taxes,
      },
    );
  }

  private calculateWorkOrder(workOrderItems: WorkorderItem[]): { subTotal: number; taxes: number; total: number } {
    const IVA = 0;
    const subTotal = workOrderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    const taxes = subTotal * IVA;
    const total = subTotal + taxes;

    return { subTotal, taxes, total };
  }

  async updateWorkOrder(data: any) {
    this.logger.log('updateWorkOrder');
    return this.repository.save(data);
  }

  async findWorkOrderItemById(id: number) {
    this.logger.log('findWorkOrderItemById');
    return this.repository.manager.findOne(WorkorderItem, {
      where: { id },
      relations: ['workorder', 'itemStatus', 'userAssigned', 'workorder.workOrderItems'],
    });
  }

  async updateWorkOrderItem(data: any) {
    this.logger.log('updateWorkOrderItem');
    return this.repository.manager.save(WorkorderItem, data);
  }

  async findWorkOrderWithSecurityReviewByStore(storeId: string, limit: number) {
    this.logger.log('findWorkOrderWithSecurityReviewByStore');

    return this.repository
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.store', 'store')
      .leftJoinAndSelect('wo.workOrderItems', 'item')
      .leftJoinAndSelect('wo.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.vehicleCatalog', 'vehicleCatalog')
      .leftJoinAndSelect('vehicleCatalog.brand', 'brand')
      .leftJoinAndSelect('item.workorderServicesItems', 'svc')
      .leftJoinAndSelect('svc.status', 'status')
      .leftJoinAndSelect('svc.serviceItem', 'serviceItem')
      .where('wo.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [SalesDomain.WORKORDERS_STATUS.ABORTED, SalesDomain.WORKORDERS_STATUS.HISTORICAL],
      })
      .andWhere('store.id = :storeId', { storeId })
      .andWhere('item.itemId = :securityItemId', {
        securityItemId: SERVICES_ITEM.SECURITY_CHECK,
      })
      .andWhere('status.code != :okStatus', { okStatus: 'OK' })
      .take(limit)
      .orderBy('wo.createdAt', 'DESC')
      .getMany();
  }

  async totalRecordsWorkorderByStore(storeId: string) {
    this.logger.log('totalRecordsWorkorderByStore');

    return this.repository
      .createQueryBuilder('wo')
      .leftJoin('wo.store', 'store')
      .leftJoin('wo.workOrderItems', 'item')
      .leftJoin('item.workorderServicesItems', 'svc')
      .leftJoin('svc.status', 'status')
      .where('wo.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [SalesDomain.WORKORDERS_STATUS.ABORTED, SalesDomain.WORKORDERS_STATUS.HISTORICAL],
      })
      .andWhere('store.id = :storeId', { storeId })
      .andWhere('item.itemId = :securityItemId', {
        securityItemId: SERVICES_ITEM.SECURITY_CHECK,
      })
      .andWhere('status.code != :okStatus', { okStatus: 'OK' })
      .getCount();
  }

  private readonly RELATION_WORKORDER = [
    'workOrderItems',
    'workOrderItems.workorderItemRecords',
    'workorderItemRecords',
    'budget',
    'budget.budgetGroup',
    'budget.budgetGroup.store',
    'workOrderItems.itemStatus',
    'workOrderItems.userAssigned',
    'budget.budgetGroup.channel',
    'status',
    'workOrderItems.workorderServicesItems',
    'workOrderItems.workorderServicesItems.serviceItem',
    'workOrderItems.workorderServicesItems.status',
    'workOrderItems.workorderServicesItems.assignedUser',
  ];
}
