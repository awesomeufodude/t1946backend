import { DataSource } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { WorkorderServicesItems } from '../entities/workorder-services-items';

@Injectable()
export class WorkorderServicesItemsRepository extends AbstractRepository<WorkorderServicesItems> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(WorkorderServicesItems));
  }

  async findById(id: number) {
    this.logger.log('findById');
    return await this.repository.findOne({
      where: { id },
      relations: ['serviceItem', 'status', 'assignedUser', 'workorderItem', 'workorderItem.workorder'],
    });
  }

  async findAll() {
    this.logger.log('findAll');
    return await this.repository.find();
  }

  async save(budgetServicesItems: WorkorderServicesItems) {
    this.logger.log('save');
    return await this.repository.save(budgetServicesItems);
  }

  async updateStatus(id: number, status: string, userId: string) {
    this.logger.log('updateStatus');
    await this.repository.update({ id }, { status: { code: status }, assignedUser: { id: userId } });
    return await this.findById(id);
  }
}
