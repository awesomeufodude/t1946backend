import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CustomerCompany } from 'src/infrastructure/database/entities/customer-company.entity';
import { CompanyBusinessRepository } from 'src/infrastructure/database/repositories/company-business.repository';
import { CustomerCompanyRepository } from 'src/infrastructure/database/repositories/customer-company.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { CustomersDomain } from 'src/shared/domain/customers.domain';
import { CustomersService } from '../customers.service';
import { CustomerCompanyResponseDto } from './companies.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly customerCompanyRepository: CustomerCompanyRepository,
    private readonly companyBusinessRepository: CompanyBusinessRepository,
    private readonly customerService: CustomersService,
    private readonly logger: Logger,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async getCompanyByRut(rut: string) {
    this.logger.log('getCompanyByRut', rut);

    try {
      const customerCompany = await this.customerCompanyRepository.findOne(rut);
      if (!customerCompany) {
        throw new NotFoundException('Company not found');
      }
      return new CustomerCompanyResponseDto(customerCompany);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while fetching the company');
    }
  }

  async createOrUpdateCompany(body: any) {
    this.logger.log('createOrUpdateCompany');
    let data = null;

    const customerCompany = await this.validateUniqueRut(body.rut);
    const customerPeople = await this.customerService.validateUniqueRut(body.rut);
    if (customerPeople) {
      throw new ConflictException(
        `El RUT ingresado corresponde al cliente: ${customerPeople.name} ${customerPeople.lastname} ${customerPeople.secondLastname}, correo: ${customerPeople.email}. No podrá ser asociado a este cliente.`,
      );
    } else {
      data = customerCompany
        ? await this.updateCustomerCompany(body, customerCompany)
        : await this.createCustomerCompany(body);
    }

    return new CustomerCompanyResponseDto(data);
  }

  async createCustomerCompany(body: any): Promise<Omit<CustomerCompany, 'id'> & { id: number | string }> {
    this.logger.log('createCustomerCompany', body);

    const customerValidateEmail = await this.getCompanyByEmail(body.contactEmail);
    if (customerValidateEmail)
      throw new ConflictException(
        `El EMAIL ingresado corresponde al cliente: ${customerValidateEmail.legalName}, correo: ${customerValidateEmail.contactEmail}. No podrá ser asociado a este cliente.`,
      );

    const customerCompany = new CustomerCompany();
    customerCompany.rut = body.rut;
    customerCompany.legalName = body.legalName;
    customerCompany.companyBusiness = null;
    customerCompany.businessActivity = body.businessActivity;
    customerCompany.contactEmail = body.contactEmail;
    customerCompany.phoneZone = body.phoneZone;
    customerCompany.phoneNumber = body.phoneNumber;
    customerCompany.address = body.address;
    customerCompany.officeAddress = body.officeAddress;
    customerCompany.addressLatitude = body.addressLatitude;
    customerCompany.addressLongitude = body.addressLongitude;
    customerCompany.contactName = body.contactName;
    customerCompany.contactPhoneZone = body.contactPhoneZone;
    customerCompany.contactPhoneNumber = body.contactPhoneNumber;

    await this.customerCompanyRepository.saveCustomerCompany(customerCompany);

    const customer = await this.customerRepository.create({
      customerType: CustomersDomain.CustomerType.COMPANY,
      customerCompany: customerCompany,
    });

    customerCompany.customer = customer;

    await this.customerCompanyRepository.saveCustomerCompany(customerCompany);

    const response = { ...customerCompany, id: customer.id };

    return response;
  }

  async updateCustomerCompany(
    body: any,
    customerCompany: CustomerCompany,
  ): Promise<Omit<CustomerCompany, 'id'> & { id: number | string }> {
    this.logger.log('updateCustomerCompany', body);

    const customerValidateEmail = await this.getCompanyByEmail(body.contactEmail);

    if (customerValidateEmail && customerValidateEmail.rut !== customerCompany.rut)
      throw new ConflictException(
        `El Email ingresado corresponde al cliente: ${customerValidateEmail.legalName}, correo: ${customerValidateEmail.contactEmail}. No podrá ser asociado a este cliente.`,
      );

    customerCompany.rut = body.rut;
    customerCompany.legalName = body.legalName;
    customerCompany.companyBusiness = null;
    customerCompany.businessActivity = body.businessActivity;
    customerCompany.contactEmail = body.contactEmail;
    customerCompany.phoneZone = body.phoneZone;
    customerCompany.phoneNumber = body.phoneNumber;
    customerCompany.address = body.address;
    customerCompany.officeAddress = body.officeAddress;
    customerCompany.addressLatitude = body.addressLatitude;
    customerCompany.addressLongitude = body.addressLongitude;
    customerCompany.contactName = body.contactName;
    customerCompany.contactPhoneZone = body.contactPhoneZone;
    customerCompany.contactPhoneNumber = body.contactPhoneNumber;

    await this.customerCompanyRepository.saveCustomerCompany(customerCompany);
    await this.customerService.createOrUpdateCustomerOptions(customerCompany.customer.id, body);

    const response = { ...customerCompany, id: customerCompany.customer.id };

    return response;
  }

  public async validateUniqueRut(rut: string) {
    return await this.customerCompanyRepository.findOne(rut);
  }

  public async getCompanyByEmail(email: string) {
    return await this.customerCompanyRepository.getCompanyByEmail(email);
  }
}
