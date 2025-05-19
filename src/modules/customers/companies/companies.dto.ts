import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsNumber()
  @IsOptional()
  companyBusinessId?: number;

  @IsString()
  @IsNotEmpty()
  businessActivity: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsNumber()
  @IsNotEmpty()
  phoneZone: number;

  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsNumber()
  @IsNotEmpty()
  contactPhoneZone: number;

  @IsNumber()
  @IsNotEmpty()
  contactPhoneNumber: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  addressLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  addressLongitude: number;

  @IsOptional()
  @IsString()
  contactLastname?: string;

  @IsOptional()
  @IsNumber()
  customerCategoryId?: number;

  @IsOptional()
  @IsNumber()
  consultationChannelId?: number;

  @IsOptional()
  @IsBoolean()
  sendPromotions?: boolean;

  @IsOptional()
  @IsBoolean()
  sendNewsletters?: boolean;
}

export class CustomerCompanyResponseDto {
  id: string | number;
  rut: string;
  legalName: string;
  companyBusiness?: CompanyBusinessDto;
  businessActivity: string;
  contactName: string;
  contactEmail: string;
  phoneZone: number;
  phoneNumber: number;
  contactPhoneZone: number;
  contactPhoneNumber: number;
  address: string;
  officeAddress: string;
  addressLatitude: number;
  addressLongitude: number;

  constructor(data: any) {
    this.id = data.customer?.id;
    this.rut = data.rut;
    this.legalName = data.legalName;
    this.companyBusiness = data.companyBusiness;
    this.businessActivity = data.businessActivity;
    this.contactName = data.contactName;
    this.contactEmail = data.contactEmail;
    this.phoneZone = data.phoneZone;
    this.phoneNumber = data.phoneNumber;
    this.contactPhoneZone = data.contactPhoneZone;
    this.contactPhoneNumber = data.contactPhoneNumber;
    this.address = data.address;
    this.officeAddress = data.officeAddress;
    this.addressLatitude = data.addressLatitude;
    this.addressLongitude = data.addressLongitude;
  }
}

export class CompanyBusinessDto {
  id: number;
  companyBusiness: string;
}
