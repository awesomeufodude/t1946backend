import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { DataSource } from 'typeorm';
import { SearchCriteria } from '../entities/search-criteria';

@Injectable()
export class SearchCriteriaRepository extends AbstractRepository<SearchCriteria> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(SearchCriteria));
  }

  async findByCode(code: string): Promise<SearchCriteria> {
    this.logger.log(`findByCode: ${code}`);
    return await this.repository.findOneBy({ code });
  }
}
