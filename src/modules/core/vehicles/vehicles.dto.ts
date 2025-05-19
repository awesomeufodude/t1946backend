import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { CoreDtos } from 'src/shared/dtos/core.dto';

export class CreateVehicleRequestDto {
  @IsNotEmpty()
  vehicleCatalogId: string;

  @IsNotEmpty()
  plateCountry: string;

  @IsNotEmpty()
  plate: string;

  @IsNotEmpty()
  color: string;

  @IsNotEmpty()
  year: number;
}

export class VehicleDto {
  id: string;

  vehicleCatalogId: string;

  plate: string;

  color: string;

  createdAt: Date;

  updatedAt: Date;
}

export class BrandDto {
  id?: string | null;
  @IsString()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value))
  name?: string | null;
  codeWs?: string | null;
  imgUrl?: string | null;
}

export class ModelDto {
  id?: string | null;
  @IsString()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value))
  name?: string | null;
  codeWs?: string | null;
}

export class VersionDto {
  @IsOptional()
  id?: string | null;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value))
  name?: string | null;
  codeWs?: string | null;
  imgUrl?: string | null;
}

export class CreateVehicleByPlateDto {
  @ValidateNested()
  @Type(() => BrandDto)
  @IsOptional()
  brand?: BrandDto;

  @ValidateNested()
  @Type(() => ModelDto)
  @IsOptional()
  model?: ModelDto;

  @ValidateNested()
  @Type(() => VersionDto)
  @IsOptional()
  version?: VersionDto | null;

  @IsNumber()
  @IsOptional()
  year?: number | null;

  @IsString()
  @IsOptional()
  color?: string | null;

  @IsUrl()
  @IsOptional()
  imageModel?: string | null;

  @IsUrl()
  @IsOptional()
  imageBrand?: string | null;

  @IsNumber()
  @IsOptional()
  odometer?: number | null;

  @IsOptional()
  odometerUpdateDate?: string | null;

  @IsString()
  @IsOptional()
  owner?: string | null;

  @IsString()
  @IsOptional()
  technicalReviewMonth?: string | null;
}

export class ResponseCreateVehicleByPlateDto {
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
  owner?: string | null;
  technicalReviewMonth?: string | null;
}

export class ResponseHistorical {
  id: string;
  budgetId: string;
  createdBy: CoreDtos.UserDto;
  customer: Customer;
  vehicle: Vehicle;
  store: {
    id: string;
    name: string;
    address: string;
  };
  total: number;
  extended: boolean;
  expiresAt: string;
  status: string;
  deliveryTime: string;
  deliveryMode: string;
  reassigned: boolean;
  reassignedTo: CoreDtos.UserDto;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    this.id = data.id;
    this.budgetId = data.budget.id;
    this.createdBy = new CoreDtos.UserDto(data.createdBy);
    this.customer = new Customer(data.customer?.customerPeople ?? data.customer?.customerCompany);
    this.vehicle = new Vehicle(data);
    this.store = data.budget?.budgetGroup?.store;
    this.total = data.total;
    this.extended = data.extended ?? false;
    this.expiresAt = data.expiresAt ?? '';
    this.status = data.status?.code;
    this.deliveryTime = data.deliveryTime;
    this.deliveryMode = data.deliveryMode;
    this.reassigned = data.reassigned;
    this.reassignedTo = data.reassignedTo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Customer {
  id: string;
  document: string;
  email: string;
  name: string;
  lastname: string;
  secondLastname: string;
  phoneZone: string;
  phoneNumer: string;

  constructor(data: any) {
    this.id = data.id;
    this.document = data.documentId;
    this.email = data.email;
    this.name = data.name ?? data.legalName ?? '';
    this.lastname = data.lastname ?? '';
    this.secondLastname = data.secondLastname ?? '';
    this.phoneZone = data.phoneZone;
    this.phoneNumer = data.phoneNumer;
  }
}

export class Vehicle {
  id: string;
  brand: BrandDto;
  model: ModelDto;
  version: VersionDto;
  year: number;
  color?: string;
  plate: string;
  plateCountry?: string | null;
  imageModel?: string | null;
  imageBrand?: string | null;
  odometer?: number | null;
  odometerUpdateDate?: string | null;
  owner: string;

  constructor(data: any) {
    this.id = data.vehicle?.id;
    this.brand = data.vehicle?.vehicleCatalog?.brand;
    this.model = data.vehicle?.vehicleCatalog?.model;
    this.version = data.vehicle?.vehicleCatalog?.version;
    this.year = data.vehicle?.year;
    this.color = data.vehicle?.color ?? '';
    this.plate = data.vehicle?.plate;
    this.plateCountry = data.vehicle?.plateCountry;
    this.imageModel = data.vehicle?.imageModel;
    this.imageBrand = data.vehicle?.imageBrand;
    this.odometer = data.vehicle?.odometer;
    this.odometerUpdateDate = data.vehicle?.odometerUpdateDate;
    this.owner = data.vehicle?.owner;
  }
}

export class User {
  id: string;
  name: string;
  lastname: string;
}
