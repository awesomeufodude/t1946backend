import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';
import { CustomerCompany } from '../entities/customer-company.entity';

@Injectable()
export class CustomerCompanyRepository extends AbstractRepository<CustomerCompany> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(CustomerCompany));
  }

  async findOne(rut: string) {
    this.logger.log(`findOne - Searching for: ${JSON.stringify(rut)}`);
    const cleanDocumentId = rut.replace(/\./g, '');

    return await this.repository.findOne({
      where: { rut: cleanDocumentId },
      relations: ['customer'],
    });
  }

  async saveCustomerCompany(customerCompany: CustomerCompany): Promise<CustomerCompany> {
    return await this.repository.save(customerCompany);
  }

  async getCompanyByEmail(email: string): Promise<CustomerCompany> {
    return await this.repository.findOne({ where: { contactEmail: email } });
  }
}
