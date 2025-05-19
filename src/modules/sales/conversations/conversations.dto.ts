import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreDtos } from 'src/shared/dtos/core.dto';
export class GetConversationsDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  storeId: string;
}

export class PostConversationDto {
  @IsNotEmpty()
  @IsString()
  channel: string;
  @IsNotEmpty()
  @IsString()
  storeId: string;
  @IsOptional()
  @IsString()
  vehicleId: string;
  @IsOptional()
  @IsString()
  customerId: string;
  @IsOptional()
  @IsString()
  leadId: string;
  @IsOptional()
  @IsString()
  consultationChannelId: string;
  budget: {
    items: BudgetItemRequestDto[];
  };
  @IsOptional()
  searchByVehicle: boolean;
  @IsOptional()
  doublePlp: boolean;
  @IsOptional()
  measureDouble: {
    front?: CoreDtos.MeasureTireDto;
    rear?: CoreDtos.MeasureTireDto;
  };
}

export class PostNewItemDto {
  channel: string;
  storeId: string;
  budgetItem: BudgetItemRequestDto;

  @IsOptional()
  searchByVehicle?: boolean;
  @IsOptional()
  doublePlp?: boolean;
  @IsOptional()
  measureDouble?: {
    front?: CoreDtos.MeasureTireDto;
    rear?: CoreDtos.MeasureTireDto;
  };
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  itemIndex?: number;
}

export class PatchUpdateItemDto {
  @IsNumber()
  quantity: number;

  @IsBoolean()
  isChecked: boolean;

  groupedIds?: string[];

  @IsOptional()
  searchByVehicle: boolean;
  @IsOptional()
  doublePlp: boolean;
  @IsOptional()
  measureDouble: {
    front?: CoreDtos.MeasureTireDto;
    rear?: CoreDtos.MeasureTireDto;
  };
}

export class BudgetItemRequestDto {
  @IsString()
  itemType: string;
  @IsString()
  itemId: string;
  @IsNumber()
  quantity: number;
  @IsNumber()
  businessLineId: number;
  data?: CoreDtos.ItemData;
}

export class PutChangeItemDto {
  budgetItem: BudgetItemRequestDto[];
}

export class ExtendConversationDto {
  @IsBoolean()
  extended: boolean;
}

export class CreateBudgetDto {
  budgetIdReference: string;
}

export class UpdateBudgetDto {
  vehicleId: string | null;
  leadId: string | null;
  customerId: string | null;
}
