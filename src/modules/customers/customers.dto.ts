import { CustomerOption } from 'src/infrastructure/database/entities/customer-option.entity';
import { CustomersDomain } from 'src/shared/domain/customers.domain';

export class CreateLeadDto {
  name?: string;
  lastname?: string;
  secondLastname?: string;
  phoneZone?: string;
  phone?: string;
  document?: string;
  address?: string;
  sendPromotions?: boolean;
  sendNewsletters?: boolean;
}

export class ResponseLeadDto {
  id: string;
  name: string;
  lastname: string;
  secondLastname: string;
  email: string;
  phoneZone: number;
  phoneNumber: number;
  document?: string;
  address?: string;
  addressLatitude?: number;
  addressLongitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ResponseCustomerDto {
  id: string;
  customerPeople: CustomerDto;

  constructor(id: string, customerPeople: CustomerDto) {
    this.id = id;
    this.customerPeople = customerPeople;
  }
}

export class ResponseSearchCustomerDto {
  id: string;
  customerPeople: CustomerDto;
  customerOptions: CustomerOption;

  constructor(id: string, customerPeople: CustomerDto, customerOption?: CustomerOption) {
    this.id = id;
    this.customerPeople = customerPeople;

    if (customerOption) {
      this.customerOptions = customerOption;
    }
  }
}

export class CreateCustomerDto {
  name?: string;
  lastname?: string;
  secondLastname?: string;
  phoneZone?: string;
  phone?: string;
  document?: string;
  documentType?: string;
  address?: string;
  addressLongitude?: number;
  addressLatitude?: number;
  consultationChannel?: string;
}

export class CustomerDto {
  id: string;
  name: string;
  lastname: string;
  secondLastname: string;
  phoneZone: number;
  phone: number;
  document: string;
  address: string;
  addressLatitude: number;
  addressLongitude: number;
  consultationChannel: string;
}

export class CustomerTypeDto {
  customerType: CustomersDomain.CustomerType.PERSON;
  customerPeople: CreateCustomerDto;
}
