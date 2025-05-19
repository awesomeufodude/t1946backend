import { Inject, Injectable, Logger } from '@nestjs/common';
import moment from 'moment-timezone';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import DateUtils from 'src/shared/utils/date.utils';
import { Between, DataSource, DeepPartial, In, MoreThanOrEqual, Not } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { BudgetGroup } from '../entities/budget-group.entity';
import { BudgetItem } from '../entities/budget-item.entity';
import { Budget } from '../entities/budget.entity';
import { Workorder } from '../entities/workorder.entity';
import { AbstractRepository } from './abstract.repository';
import { SERVICES_ITEM } from 'src/modules/common/constants';

@Injectable()
export class BudgetGroupRepository extends AbstractRepository<BudgetGroup> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(BudgetGroup));
  }

  private readonly RELATIONS = [
    'budgets',
    'budgets.budgetItems',
    'budgets.budgetItems.budgetServicesItems',
    'budgets.budgetItems.budgetServicesItems.serviceItem',
    'budgets.budgetItems.budgetServicesItems.status',
    'budgets.budgetItems.budgetServicesItems.assignedUser',
    'budgets.searchHistories',
    'budgets.searchHistories.searchCriteria',
    'budgets.notes',
    'createdBy',
    'store',
    'channel',
    'budgets.appointments',
    'budgets.status',
  ];

  private compareBudgetItems(a: any, b: any): number {
    if (a.itemComboId === null && b.itemComboId !== null) return -1;
    if (a.itemComboId !== null && b.itemComboId === null) return 1;

    return a.itemId.localeCompare(b.itemId);
  }

  async findByIdUserAndStore(id: number, userId: string, storeId: string) {
    this.logger.log('findByIdUserAndStore');
    const conversation = await this.repository.findOne({
      where: { id, createdBy: { id: userId }, store: { id: storeId } },
      relations: this.RELATIONS,
    });

    if (conversation) {
      conversation.budgets.forEach((budget) => {
        budget.budgetItems = budget.budgetItems.sort(this.compareBudgetItems);
        budget.budgetItems.forEach((item) => {
          if (item.budgetServicesItems && item.budgetServicesItems.length > 0) {
            item.budgetServicesItems = item.budgetServicesItems.sort(
              (a, b) => a.serviceItem.order - b.serviceItem.order,
            );
          }
        });
      });
    }

    return conversation;
  }

  async findByIdAndUser(id: number, userId: string) {
    this.logger.log('findByIdAndUser');
    const conversation = await this.repository.findOne({
      where: { id, createdBy: { id: userId } },
      relations: this.RELATIONS,
    });

    if (conversation) {
      conversation.budgets.forEach((budget) => {
        budget.budgetItems = budget.budgetItems.sort(this.compareBudgetItems);
      });
    }

    return conversation;
  }

  async findById(id: number) {
    this.logger.log('findById');
    const conversation = await this.repository.findOne({
      where: { id },
      relations: this.RELATIONS,
    });

    if (conversation) {
      conversation.budgets.forEach((budget) => {
        budget.budgetItems = budget.budgetItems.sort(this.compareBudgetItems);
      });
    }

    return conversation;
  }

  async findByIdAndStore(id: number, storeId: string) {
    this.logger.log('findByIdAndStore');
    const conversation = await this.repository.findOne({
      where: { id, store: { id: storeId } },
      relations: this.RELATIONS,
    });

    if (conversation) {
      conversation.budgets.forEach((budget) => {
        budget.budgetItems = budget.budgetItems.sort(this.compareBudgetItems);
      });
    }

    return conversation;
  }

  async create(data: DeepPartial<BudgetGroup>): Promise<BudgetGroup> {
    this.logger.log('create');
    let idBudgetGroup = null;
    await this.repository.manager.transaction(async (em) => {
      const newBudgetGroup = await em.save(BudgetGroup, data);
      idBudgetGroup = newBudgetGroup.id;
      await em.save(Budget, {
        id: `${idBudgetGroup}-1`,
        budgetGroup: { id: idBudgetGroup },
        budgetItems: [],
        appointments: [],
        status: { code: SalesDomain.BUDGET_STATUS.CREATING },
      });
    });
    return await this.findById(idBudgetGroup);
  }

  async delete(id: number) {
    this.logger.log('delete');
    const budgetGroup = await this.repository.findOne({
      where: { id },
      relations: ['budgets'],
    });

    if (!budgetGroup) {
      throw new Error('Budget group not found');
    }

    if (budgetGroup.sent) {
      throw new Error('Cannot delete a sent budget');
    }

    await this.repository.manager.transaction(async (em) => {
      this.logger.log('Deleting budget items');
      for (const budget of budgetGroup.budgets) {
        if (budget.workorder) {
          this.logger.log(`Deleting workorder for budget ${budget.id}`);
          await em.getRepository(Workorder).delete({ budget });
        }
        await em.getRepository(BudgetItem).delete({ budget });
        await em.getRepository(Appointment).delete({ budget });
      }
      this.logger.log('Deleting budgets');
      await em.getRepository(Budget).delete({ budgetGroup });
      this.logger.log('Deleting budget group');
      await em.getRepository(BudgetGroup).delete(id);
    });
  }

  async findBudgetsByUserAndDate(userId: string, date: Date, store: any) {
    this.logger.log('findBudgetsByUserAndDate');
    return await this.findByUserAndDate(userId, date, true, store);
  }

  async findConversationsByUserAndDate(userId: string, date: Date, store: any) {
    this.logger.log('findConversationsByUserAndDate');
    return await this.findByUserAndDate(userId, date, false, store);
  }

  async findByUserAndDate(userId: string, date: Date, sent: boolean, storeId: any) {
    const [startOfDay, endOfDay] = DateUtils.getStarAndEndOfDay();
    const currentDate = moment().tz('America/Santiago').toDate();
    const startTime = Date.now();
    const budgetGroups = await this.repository.find({
      where: [
        {
          createdBy: { id: userId },
          sent,
          budgets: {
            status: Not(
              In([
                SalesDomain.BUDGET_STATUS.CANCELLED,
                SalesDomain.BUDGET_STATUS.EXPIRED,
                SalesDomain.BUDGET_STATUS.APPROVED,
              ]),
            ),
          },
          store: { id: storeId },
        },
        {
          createdBy: { id: userId },
          sent,
          budgets: { status: { code: SalesDomain.BUDGET_STATUS.EXPIRED } },
          expiresAt: sent ? Between(startOfDay, endOfDay) : MoreThanOrEqual(currentDate),
          store: { id: storeId },
        },
      ],
      relations: ['budgets', 'budgets.status', 'budgets.appointments', 'budgets.workorder'],
      order: { id: 'DESC' },
    });
    const filteredBudgetGroups = budgetGroups.filter((group) => {
      return group.budgets.every((budget) => budget.workorder === null && budget.appointments.length === 0);
    });
    this.logger.log(`Query time: ${Date.now() - startTime}ms`);
    return filteredBudgetGroups;
  }

  async save(data: DeepPartial<BudgetGroup>): Promise<BudgetGroup> {
    this.logger.log('save budget group');
    return await this.repository.save(data);
  }

  async updateVehicleCustomerAndLead(budgetGroup: BudgetGroup, customerId: string, leadId: string, vehicleId: string) {
    this.logger.log('updateVehicleCustomerAndLead');
    await this.repository.manager.transaction(async (em) => {
      await em.update(
        BudgetGroup,
        { id: budgetGroup.id },
        { vehicle: { id: vehicleId }, customer: { id: customerId }, lead: { id: leadId } },
      );
    });
  }

  async updateVehicle(budgetGroupId: number, vehicleId: string) {
    this.logger.log('updateVehicle');
    await this.repository.manager.transaction(async (em) => {
      await em.update(BudgetGroup, { id: budgetGroupId }, { vehicle: { id: vehicleId } });
    });
  }

  async findConversationWithSecurityReviewByStore(store: string, maxVisibleItems: number) {
    this.logger.log('findConversationWithSecurityReviewByStore');

    return this.findByStoreAndDate(store, false, maxVisibleItems);
  }

  async findBudgetWithSecurityReviewByStore(store: string, maxVisibleItems: number) {
    this.logger.log('findBudgetWithSecurityReviewByStore');

    return this.findByStoreAndDate(store, true, maxVisibleItems);
  }

  async totalRecordsConversation(storeId: string) {
    return await this.totalRecordsByStore(storeId, false);
  }

  async totalRecordsBudget(storeId: string) {
    return await this.totalRecordsByStore(storeId, true);
  }

  async findByStoreAndDate(storeId: string, sent: boolean, maxVisibleItems: number) {
    this.logger.log('findByStoreAndDate');

    const query = this.buildQueryByStoreAndSecurityCheckFilters(storeId, sent)
      .leftJoinAndSelect('bg.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.vehicleCatalog', 'vehicleCatalog')
      .leftJoinAndSelect('vehicleCatalog.brand', 'brand')
      .leftJoinAndSelect('svc.serviceItem', 'serviceItem')
      .orderBy('bg.createdAt', 'DESC')
      .take(maxVisibleItems);

    return await query.getMany();
  }

  async totalRecordsByStore(storeId: string, sent: boolean) {
    this.logger.log('totalRecordsByStore', JSON.stringify({ storeId, sent }, null, 2));

    const query = this.buildQueryByStoreAndSecurityCheckFilters(storeId, sent);
    return await query.getCount();
  }

  private buildQueryByStoreAndSecurityCheckFilters(storeId: string, sent: boolean) {
    return this.repository
      .createQueryBuilder('bg')
      .innerJoin('bg.store', 'store')
      .innerJoin('bg.budgets', 'budget')
      .innerJoin('budget.status', 'status')
      .innerJoin('budget.budgetItems', 'item')
      .innerJoin('item.budgetServicesItems', 'svc')
      .innerJoin('svc.status', 'svcStatus')
      .where('bg.sent = :sent', { sent })
      .andWhere('store.id = :storeId', { storeId })
      .andWhere('status.code NOT IN (:...excluded)', {
        excluded: [
          SalesDomain.BUDGET_STATUS.CANCELLED,
          SalesDomain.BUDGET_STATUS.EXPIRED,
          SalesDomain.BUDGET_STATUS.APPROVED,
        ],
      })
      .andWhere('item.itemId = :securityCheckItem', {
        securityCheckItem: SERVICES_ITEM.SECURITY_CHECK,
      })
      .andWhere('item.isChecked = :isChecked', { isChecked: true })
      .andWhere('svcStatus.code != :okStatus', { okStatus: 'OK' })
      .andWhere('bg.vehicle IS NOT NULL');
  }
}
