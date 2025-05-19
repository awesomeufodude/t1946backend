import { DataSource } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { BudgetItem } from '../entities/budget-item.entity';

@Injectable()
export class BudgetItemRepository extends AbstractRepository<BudgetItem> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(BudgetItem));
  }

  async findById(id: number) {
    this.logger.log('findById');
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findAll() {
    this.logger.log('findAll');
    return await this.repository.find();
  }

  async save(budgetServicesItems: BudgetItem) {
    this.logger.log('save');
    return await this.repository.save(budgetServicesItems);
  }

  async updateItem(id: number, item: BudgetItem) {
    this.logger.log('updateItem');
    return await this.repository.update({ id }, item);
  }

  async findByIdItemAndBudgetId(itemId: string, budgetId: string) {
    this.logger.log('findByIdItemAndBudgetId');
    return await this.repository.findOne({
      where: { itemId, budget: { id: budgetId } },
    });
  }

  async deleteItem(id: number) {
    this.logger.log('deleteItem');
    return await this.repository.delete({ id });
  }
}
