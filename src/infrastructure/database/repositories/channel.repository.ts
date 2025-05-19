import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class ChannelRepository extends AbstractRepository<Channel> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Channel));
  }
}
