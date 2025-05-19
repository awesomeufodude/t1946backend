import { Logger } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';

export class AbstractRepository<T> {
  private _logger: Logger;

  constructor(protected readonly repository: Repository<T>) {
    this._logger = new Logger('AbstractRepository');
  }

  async create(data: DeepPartial<T>): Promise<T> {
    this._logger.log(`create: ${data}`);
    return await this.repository.save(data);
  }

  async findAll(): Promise<T[]> {
    this._logger.log('findAll');
    return await this.repository.find();
  }

  async update(id: string, data: T): Promise<T> {
    this._logger.log(`update: ${id}`);
    return await this.repository.save(data);
  }
}
