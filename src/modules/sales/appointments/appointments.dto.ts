import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Appointment, AppointmentMode } from 'src/infrastructure/database/entities/appointment.entity';
import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { CoreDtos } from 'src/shared/dtos/core.dto';

export class ResponseAppointmentDto {
  id: string;
  appointmentDate: Date;
  mode: string;
  status: string;
  budget: AppointmentBudgetDto;
  locationPickup?: Location | null;
  needDeliveryReturn?: boolean;
  hasDifferentLocationDelivery?: boolean;
  locationDelivery?: Location | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(appointment: Appointment) {
    this.id = appointment.id;
    this.appointmentDate = appointment.appointmentDate;
    this.mode = appointment.mode;
    this.status = appointment.status.code;
    this.budget = new AppointmentBudgetDto(appointment.budget);
    this.locationPickup = new Location({
      address: appointment.pickupAddress,
      addressNumber: appointment.pickupAddressNumber,
      addressComment: appointment.pickupAddressComment,
      addressLatitude: appointment.pickupAddressLatitude,
      addressLongitude: appointment.pickupAddressLongitude,
    });
    this.needDeliveryReturn = appointment.needDeliveryReturn;
    this.hasDifferentLocationDelivery = appointment.hasDifferentLocationDelivery;
    this.locationDelivery = new Location({
      address: appointment.deliveryAddress,
      addressNumber: appointment.deliveryAddressNumber,
      addressComment: appointment.deliveryAddressComment,
      addressLatitude: appointment.deliveryAddressLatitude,
      addressLongitude: appointment.deliveryAddressLongitude,
    });
    this.createdAt = appointment.createdAt;
    this.updatedAt = appointment.updatedAt;
  }
}

export class Location {
  address: string;
  addressNumber: string;
  addressComment: string;
  addressLatitude: number;
  addressLongitude: number;

  constructor(location: LocationDto) {
    this.address = location.address;
    this.addressNumber = location.addressNumber;
    this.addressComment = location.addressComment;
    this.addressLatitude = location.addressLatitude;
    this.addressLongitude = location.addressLongitude;
  }
}

export class AppointmentBudgetDto {
  id: string;
  total: number;
  status: string;
  customer: Customer | CoreDtos.LeadDto;
  vehicle: CoreDtos.VehicleDto;
  createdAt: Date;
  updatedAt: Date;

  constructor(budget: Budget) {
    this.id = budget.id;
    this.status = budget.status.code;
    this.total = budget.total;
    this.createdAt = budget.createdAt;
    this.updatedAt = budget.updatedAt;
    if (budget.budgetGroup.customer) {
      this.customer = budget.budgetGroup.customer;
    } else {
      this.customer = new CoreDtos.LeadDto(budget.budgetGroup.lead);
    }
    this.vehicle = new CoreDtos.VehicleDto(budget.budgetGroup.vehicle);
  }
}

export class GetAppointmentsDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsUUID()
  storeId: string;
}

class LocationDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  addressComment?: string;

  @IsOptional()
  @IsNumber()
  addressLatitude?: number;

  @IsOptional()
  @IsNumber()
  addressLongitude?: number;
}

// DTO principal
export class CreateAppointmentDto {
  @IsString()
  budgetId: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsEnum(AppointmentMode)
  mode: AppointmentMode;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  locationPickup: LocationDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  locationDelivery: LocationDto | null;

  @IsBoolean()
  needDeliveryReturn: boolean;

  @IsBoolean()
  hasDifferentLocationDelivery: boolean;
}
