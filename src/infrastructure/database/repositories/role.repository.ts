import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class RoleRepository extends AbstractRepository<Role> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Role));
  }

  async findById(id: string): Promise<Role> {
    this.logger.log(`findById: ${id}`);
    return await this.repository.findOneBy({ id });
  }

  async find(options: any): Promise<Role[]> {
    this.logger.log('find');
    return await this.repository.find(options);
  }
}
