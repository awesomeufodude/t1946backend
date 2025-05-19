import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConsultationChannel } from '../entities/consultation-channel.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class ConsultationChannelRepository extends AbstractRepository<ConsultationChannel> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(ConsultationChannel));
  }

  async findById(id: string) {
    this.logger.log('findById');
    return await this.repository.findOne({
      where: { id },
    });
  }
}
