import { Body, Controller, Delete, Param, Post, Logger } from '@nestjs/common';
import { FilesService } from './files.service';
import { AppDomain } from 'src/shared/domain/app.domain';
import { Private } from 'src/shared/decorators/auth.decorators';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CreateFileToNoteDto } from './files.dto';

@Controller('sales/v1/notes/files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.DELETE_FILE_NOTE])
  @Delete(':fileId')
  async deleteFile(@Param('fileId') fileId: number) {
    this.logger.log('Deleting file', fileId);
    const data = await this.filesService.delete(fileId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.ADD_FILE_TO_NOTE])
  @Post()
  async addFilesToNote(@Body() body: CreateFileToNoteDto) {
    this.logger.log('Adding files to note', JSON.stringify(body));
    const data = await this.filesService.addFilesToNote(body);
    return new SuccessResponseDto(data);
  }
}
