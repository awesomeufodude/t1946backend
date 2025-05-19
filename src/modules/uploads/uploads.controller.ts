import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
  Request,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { UploadsService } from './uploads.service';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { UploadDto } from './upload.dto';
@Controller('upload-chunk')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly logger: Logger,
  ) {}
  @Post()
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(@Request() req, @UploadedFile() chunk: Express.Multer.File, @Body() body: UploadDto) {
    this.logger.log('Uploading chunk', JSON.stringify(body));

    if (!chunk || !body.fileId || body.chunkIndex === undefined || !body.totalChunks) {
      throw new BadRequestException('Missing required fields');
    }

    const chunkDir = `/app/tmp/uploads/${body.fileId}`;
    await fs.promises.mkdir(chunkDir, { recursive: true });
    const chunkPath = path.join(chunkDir, `chunk_${body.chunkIndex}`);
    await fs.promises.writeFile(chunkPath, chunk.buffer);
    const existingChunks = await fs.promises.readdir(chunkDir);
    const userId = req.user.sub;
    if (existingChunks.length === Number(body.totalChunks)) {
      await this.uploadsService.assembleAndQueue(
        body.fileId,
        Number(body.totalChunks),
        body.originalName,
        body,
        userId,
      );
    }
    return { status: 'ok', fileId: body.fileId };
  }

  @Get(':fileId/status')
  async getStatus(@Param('fileId') fileId: string) {
    this.logger.log('Getting upload status', fileId);
    const status = await this.uploadsService.getUploadStatus(fileId);
    if (!status) throw new NotFoundException();
    return new SuccessResponseDto(status);
  }
}
