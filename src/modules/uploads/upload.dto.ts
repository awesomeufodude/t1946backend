import { IsString } from 'class-validator';

export class UploadDto {
  @IsString()
  fileId: string;

  @IsString()
  chunkIndex: string;

  @IsString()
  totalChunks: string;

  @IsString()
  originalName: string;

  @IsString()
  storeId: string;

  @IsString()
  type: string;

  @IsString()
  id: string;

  @IsString()
  typeFile: string;
}
