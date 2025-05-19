import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { BrandDto, ModelDto, VersionDto } from 'src/modules/core/vehicles/vehicles.dto';
import { ResponseCreateVehicleByPlateDto } from '../core/vehicles/vehicles.dto';

export class GetSearchResultsDto {
  @IsString()
  @IsNotEmpty()
  keywords: string;
}

export class ResponseSearchDto {
  customers: CustomerOrLeadDto[];
  vehicles: ResponseCreateVehicleByPlateDto[];
  leads: CustomerOrLeadDto[];
  companies: CompanyDto[];

  constructor(customersData: any[], vehiclesData: any[], leadsData: any[], companiesData: any[]) {
    this.customers = customersData.map((customer) => this.mapToCustomerOrLeadDto(customer.id, customer.customerPeople));
    this.leads = plainToInstance(CustomerOrLeadDto, leadsData);
    this.vehicles = vehiclesData.map((vehicle) => this.mapToVehicleDto(vehicle));
    this.companies = companiesData.map((company) => this.mapToCompanyDto(company.id, company.customerCompany));
  }

  private mapToCustomerOrLeadDto(id: string, data: any): CustomerOrLeadDto {
    return {
      id: id,
      name: data.name,
      lastname: data.lastname,
      secondLastname: data.secondLastname,
      phoneZone: data.phoneZone,
      phone: data.phoneNumber || '',
      document: data.documentId || '',
      address: data.address || '',
      email: data.email,
    };
  }

  private mapToCompanyDto(id: string, company: any): CompanyDto {
    return {
      id,
      name: company.name,
      rut: company.rut,
      address: company.address,
      legalName: company.legalName,
      companyBusiness: company.companyBusiness?.company_business || null,
      businessActivity: company.businessActivity,
      contactName: company.contactName,
      contactLastName: company.contactLastName,
      contactEmail: company.contactEmail,
      contactPhoneNumber: company.contactPhoneNumber,
      contactPhoneZone: company.contactPhoneZone,
      phoneNumber: company.phoneNumber,
      phoneZone: company.phoneZone,
    };
  }

  private mapToVehicleDto(vehicle: any): ResponseCreateVehicleByPlateDto {
    return {
      plate: vehicle.plate,
      plateCountry: vehicle.plateCountry,
      color: vehicle.color,
      odometer: vehicle.odometer,
      year: vehicle.vehicleCatalog.year,
      brand: vehicle.vehicleCatalog.brand,
      model: vehicle.vehicleCatalog.model,
      version: vehicle.vehicleCatalog.version,
    };
  }
}

export class CustomerOrLeadDto {
  id: string;
  name?: string;
  lastname?: string;
  secondLastname?: string;
  email?: string;
  phoneZone?: string;
  phone?: string;
  document?: string;
  address?: string;
}

export class CompanyDto {
  id: string;
  name: string;
  rut: string;
  address: string;
  legalName: string;
  companyBusiness: string | null;
  businessActivity: string;
  contactName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactPhoneZone: string;
  phoneNumber: string;
  phoneZone: string;
}

export class VehicleDto {
  id?: string | null;
  brand?: BrandDto;
  model?: ModelDto;
  version?: VersionDto;
  year?: number | null;
  color?: string | null;
  plate?: string | null;
  plateCountry?: string | null;
  imageModel?: string | null;
  imageBrand?: string | null;
  odometer?: number | null;
  odometerUpdateDate?: string | null;
}
