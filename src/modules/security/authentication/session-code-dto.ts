import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class SessionCodeRequestDto {
  @IsNotEmpty()
  operation: string;
  @IsOptional()
  email?: string;
  @IsOptional()
  @IsUUID()
  storeId: string;
  @IsOptional()
  @IsNumber()
  code?: number;
}
