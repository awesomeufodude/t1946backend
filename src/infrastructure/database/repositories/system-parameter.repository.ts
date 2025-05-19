import { Inject, Injectable, Logger } from '@nestjs/common';
import { SystemParameter } from '../entities/system-parameter.entity';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';

const CONVERSATION_EXPIRATION = 'conversation_expiration_time';
@Injectable()
export class SystemParameterRepository extends AbstractRepository<SystemParameter> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(SystemParameter));
  }

  async getConversationExpirationTime(): Promise<string | null> {
    const parameter = await this.repository.findOne({
      where: { parameterName: CONVERSATION_EXPIRATION },
    });

    return parameter ? parameter.parameterValue : null;
  }
}
