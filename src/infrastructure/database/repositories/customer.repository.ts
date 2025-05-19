import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class CustomerRepository extends AbstractRepository<Customer> {
  private documentIdRegex = /^\d+\-[a-zA-Z0-9]+$/;

  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Customer));
  }

  async searchCustomer(search: string): Promise<Customer[]> {
    this.logger.log(`Searching customers with search term: ${search}`);

    const emailRegex = /@/;

    if (this.documentIdRegex.test(search)) {
      return this.searchByDocumentId(search);
    }

    if (emailRegex.test(search)) {
      return this.searchByEmail(search);
    }

    return this.searchByFullName(search);
  }

  private async searchByDocumentId(search: string): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerPeople', 'customerPeople')
      .leftJoinAndSelect('customer.workorders', 'workorders')
      .leftJoinAndSelect('workorders.status', 'status')
      .where('customerPeople.documentId = :search', { search })
      .getMany();
  }

  private async searchByEmail(search: string): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerPeople', 'customerPeople')
      .leftJoinAndSelect('customer.workorders', 'workorders')
      .leftJoinAndSelect('workorders.status', 'status')
      .where('customerPeople.email ILIKE :search', { search: `%${search}%` })
      .getMany();
  }

  private async searchByFullName(search: string): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerPeople', 'customerPeople')
      .leftJoinAndSelect('customer.workorders', 'workorders')
      .leftJoinAndSelect('workorders.status', 'status')
      .where(
        "CONCAT(customerPeople.name, ' ', customerPeople.lastname, ' ', customerPeople.secondLastname) ILIKE :search",
        {
          search: `%${search}%`,
        },
      )
      .getMany();
  }

  async findById(id: string) {
    this.logger.log('findById', id);

    return await this.repository.findOne({
      where: { id },
      relations: ['vehiclesCustomer', 'vehiclesCustomer.customer', 'vehiclesCustomer.vehicle', 'customerOptions'],
    });
  }

  async save(customer: Customer) {
    return this.repository.save(customer);
  }

  private geCustomerQuery() {
    return this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.customerCompany', 'customerCompany')
      .leftJoinAndSelect('customerCompany.companyBusiness', 'companyBusiness')
      .leftJoinAndSelect('customer.workorders', 'workorders')
      .leftJoinAndSelect('workorders.status', 'status');
  }

  private searchByCompanyRut(search: string): Promise<Customer[]> {
    return this.geCustomerQuery().where('customerCompany.rut = :search', { search }).getMany();
  }

  async searchByNameAndLegalName(search: string): Promise<Customer[]> {
    return this.geCustomerQuery()
      .where("CONCAT(customerCompany.contactName, ' ', customerCompany.legalName) ILIKE :search", {
        search: `%${search}%`,
      })
      .getMany();
  }

  async searchCompanies(search: string): Promise<Customer[]> {
    console.log('Searching companies with search term:', search);
    if (this.documentIdRegex.test(search)) {
      return this.searchByCompanyRut(search);
    }

    return this.searchByNameAndLegalName(search);
  }
}
