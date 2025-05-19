import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LaborTime } from '../entities/labor-time.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class LaborTimeRepository extends AbstractRepository<LaborTime> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(LaborTime));
  }

  async findLaborTimeByStoreAndBusinessLine(storeId: string, businessLineId: string) {
    return this.repository.findOne({
      where: {
        storeId: storeId,
        businessLineId: Number(businessLineId),
      },
    });
  }
}
