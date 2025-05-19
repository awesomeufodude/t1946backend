import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BudgetStatus } from '../entities/budget-status.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class BudgetStatusRepository extends AbstractRepository<BudgetStatus> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(BudgetStatus));
  }
}
