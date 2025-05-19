import { IsISO8601, IsOptional, IsNotEmpty } from 'class-validator';

export class GetBudgetsDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  storeId: string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  status: string;
  @IsNotEmpty()
  budgetServiceItemId: number;
}
