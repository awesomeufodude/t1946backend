import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkorderItemRecord } from '../entities/workorder-item-records.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class WorkorderItemRecordRepository extends AbstractRepository<WorkorderItemRecord> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(WorkorderItemRecord));
  }

  async createWorkOrderItemRecord(userId, workorderId, workorderItemId) {
    this.logger.log('createWorkOrderItemRecord');
    return this.repository.save({
      workorder: { id: workorderId },
      workorderItem: { id: workorderItemId },
      userAssigned: { id: userId },
      startTime: new Date(),
    });
  }

  async finishWorkOrderItemRecord(workorderRecordId) {
    this.logger.log('finishWorkOrderItemRecord');
    return this.repository.update(
      { id: workorderRecordId },
      {
        endTime: new Date(),
      },
    );
  }

  async findWorkOrderItemRecordByWorkOrderItemId(workorderItemId) {
    this.logger.log('findWorkOrderItemRecordByWorkOrderItemId');
    return this.repository.find({
      where: { workorderItem: { id: workorderItemId } },
    });
  }
}
