import { IsString, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsUUID()
  userId: string;
  @IsString()
  eventTypeCode: string;
  createdAt: Date;
}
