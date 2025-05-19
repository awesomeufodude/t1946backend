import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { SearchHistory } from '../entities/search-history';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchHistoryRepository extends AbstractRepository<SearchHistory> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(SearchHistory));
  }

  async save(searchHistory: SearchHistory): Promise<SearchHistory> {
    this.logger.log('Saving search history');
    return this.repository.save(searchHistory);
  }

  async findByBudgetId(budgetId: string): Promise<SearchHistory[]> {
    this.logger.log(`findByBudgetId: ${budgetId}`);
    return this.repository.find({
      where: {
        budget: {
          id: budgetId,
        },
      },
    });
  }

  async deleteByBudgetId(budgetId: string): Promise<void> {
    this.logger.log(`deleteByBudgetId: ${budgetId}`);
    await this.repository.delete({
      budget: {
        id: budgetId,
      },
    });
  }
}
