import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { CoreDtos } from 'src/shared/dtos/core.dto';

export class RequestWorkorderDto {
  @IsNotEmpty()
  budgetId: string;

  @IsNotEmpty()
  mode: string;

  @IsDateString()
  @IsNotEmpty()
  deliveryDate: string;

  @IsString()
  @IsNotEmpty()
  deliveryTime: string;

  constructor(partial: Partial<RequestWorkorderDto>) {
    Object.assign(this, partial);
  }
}

export class PostNewItemDto {
  workOrderId: string;
  workOrderItem: WorkOrderItemRequestDto;
}

export class WorkOrderItemRequestDto {
  itemType: string;
  itemId: string;
  quantity: number;
  businessLineId: number;
  workOrderId: string;
  data: CoreDtos.ItemData;
}
