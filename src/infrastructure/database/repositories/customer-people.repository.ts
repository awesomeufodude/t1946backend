import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomerPeople } from '../entities/customer-people.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CustomerPeopleRepository extends AbstractRepository<CustomerPeople> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CustomerPeople));
  }

  async findByEmail(email: string): Promise<CustomerPeople | null> {
    this.logger.log('findByEmail', email);
    return this.repository.findOne({
      where: { email },
      relations: ['customer'],
    });
  }

  async findByDocument(documentId: string): Promise<CustomerPeople | null> {
    this.logger.log('findByDocument', documentId);
    const cleanDocumentId = documentId.replace(/\./g, '');
    return this.repository.findOne({
      where: { documentId: cleanDocumentId },
      relations: ['customer'],
    });
  }

  async save(customerPeople: CustomerPeople): Promise<CustomerPeople> {
    return this.repository.save(customerPeople);
  }
}
