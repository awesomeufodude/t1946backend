import { IsISO8601, IsOptional } from 'class-validator';

export class GetWorkorderDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  storeId: string;
}
