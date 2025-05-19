import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateWorkOrderItemDto {
  @IsUUID()
  technicianId: string;
}

export class AssignWorkOrderDto {
  @IsUUID()
  userId: string;
}

export class WorkOrderParamsDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  searchMode?: string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  status: string;
  @IsNotEmpty()
  workOrderServiceItemId: number;
}
