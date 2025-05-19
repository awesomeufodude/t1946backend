import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BudgetGroup } from '../entities/budget-group.entity';
import { BudgetItem } from '../entities/budget-item.entity';
import { Budget } from '../entities/budget.entity';
import { AbstractRepository } from './abstract.repository';
import { BudgetServicesItems } from '../entities/budget-services-items ';

@Injectable()
export class BudgetRepository extends AbstractRepository<Budget> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Budget));
  }

  private readonly RELATIONS = [
    'budgetItems',
    'budgetGroup',
    'budgetGroup.createdBy',
    'budgetGroup.store',
    'status',
    'notes',
    'budgetGroup.channel',
    'budgetItems.budgetServicesItems',
    'budgetItems.budgetServicesItems.serviceItem',
    'budgetItems.budgetServicesItems.status',
    'budgetItems.budgetServicesItems.notes',
    'budgetItems.budgetServicesItems.notes.files',
  ];

  async findById(id: string) {
    this.logger.log('findById');
    return await this.repository.findOne({
      where: { id },
      relations: this.RELATIONS,
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    this.logger.log('findByIdAndUser');
    return await this.repository.findOne({
      where: { id, budgetGroup: { createdBy: { id: userId } } },
      relations: this.RELATIONS,
    });
  }

  async updateBudgetItems(budget: Partial<Budget>) {
    this.logger.log('updateBudget', budget);
    await this.repository.manager.transaction(async (em) => {
      await em.delete(BudgetItem, { budget });
      this.logger.log(JSON.stringify(budget.budgetItems));
      const newBudgetItems = await this.createBudgetItemsList(em, budget.id, budget.budgetItems);

      await this.calculateAndUpdateBudget(em, budget.id, newBudgetItems);
    });

    return await this.findById(budget.id);
  }

  async createBudgetItems(budget: Budget, items: Partial<BudgetItem>[]) {
    this.logger.log('createBudgetItems', {
      budgetId: budget.id,
      items,
    });
    await this.repository.manager.transaction(async (em) => {
      const newBudgetItems = await this.createBudgetItemsList(em, budget.id, items);

      await this.calculateAndUpdateBudget(em, budget.id, newBudgetItems);
    });
    return await this.findById(budget.id);
  }

  private async createBudgetItemsList(
    em: EntityManager,
    budgetId: string,
    items: Partial<BudgetItem>[],
  ): Promise<BudgetItem[]> {
    const newBudgetItems = [];
    for (const item of items) {
      const newItem = await em.save(BudgetItem, {
        budget: { id: budgetId },
        ...item,
      });
      const budgetServicesItems = [];
      if (item.budgetServicesItems?.length) {
        for (const budgetServicesItem of item.budgetServicesItems) {
          const newBudgetServicesItem = await em.save(BudgetServicesItems, {
            budgetItem: { id: newItem.id },
            ...budgetServicesItem,
          });
          budgetServicesItems.push(newBudgetServicesItem);
        }
      }
      newItem.budgetServicesItems = budgetServicesItems;
      newBudgetItems.push(newItem);
    }
    return newBudgetItems;
  }

  private calculateAndUpdateBudget(em: EntityManager, budgetId: string, budgetItems: BudgetItem[]) {
    const { subTotal, taxes, total } = this.calculateBudget(budgetItems);
    return em.update(
      Budget,
      { id: budgetId },
      {
        total,
        subTotal,
        iva: taxes,
      },
    );
  }

  async updateBudgetStatus(ids: string[], statusCode: string) {
    this.logger.log('updateBudgetStatus');
    await this.repository.update(ids, { status: { code: statusCode } });
  }

  private calculateBudget(budgetItems: BudgetItem[]): { subTotal: number; taxes: number; total: number } {
    const IVA = 0;
    const subTotal = budgetItems
      .filter((item) => item.isChecked)
      .reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    const taxes = subTotal * IVA;
    const total = subTotal + taxes;

    return { subTotal, taxes, total };
  }

  async updateBudgetSent(budget: Budget) {
    this.logger.log('updateBudgetSent');

    await this.repository.manager.transaction(async (em) => {
      await em.update(BudgetGroup, { id: budget.budgetGroup.id }, { sent: true });
      await em.update(Budget, { id: budget.id }, { sent: budget.sent + 1, status: { code: 'SENT' } });
    });
  }

  async deleteBudget(id: string) {
    this.logger.log('deleteBudget');
    await this.repository.createQueryBuilder().delete().from(Budget).where('id = :id', { id: id }).execute();
  }
}
