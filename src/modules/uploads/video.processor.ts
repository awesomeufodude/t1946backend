import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { UploadsService } from './uploads.service';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { NoteFile } from 'src/infrastructure/database/entities/note-file.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as os from 'os';
import sharp from 'sharp';
import { promises as fsp } from 'fs';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';

ffmpeg.setFfmpegPath(ffmpegStatic);

@Processor('videoQueue')
export class VideoProcessor {
  private readonly TYPE_WORKORDERS = 'workorders';
  private readonly TYPE_BUDGETS = 'budgets';
  private readonly TYPE_BUDGET_SERVICE = 'budget_service';
  private readonly TYPE_WORKORDER_SERVICE = 'workorder_service';
  private readonly TYPE_FILE_IMAGE = 'image';
  private readonly TYPE_FILE_VIDEO = 'video';

  constructor(
    private readonly uploadsService: UploadsService,
    private readonly budgetServiceItemRepository: BudgetServicesItemsRepository,
    private readonly workorderServiceItemRepository: WorkorderServicesItemsRepository,
    private readonly minioService: MinioService,
    private readonly logger: Logger,
  ) {}
  @Process('compress')
  async handleCompress(job: Job) {
    const { fileId, inputPath, body, userId } = job.data;
    const noteFile = await this.resolveNoteFile(body, inputPath, userId);

    await this.uploadsService.updateStatus(fileId, noteFile.url);

    const tempFolder = `/app/tmp/uploads/${fileId}`;
    try {
      await fs.promises.rm(tempFolder, { recursive: true, force: true });
      this.logger.log(`Carpeta temporal eliminada: ${tempFolder}`);
    } catch (err) {
      this.logger.warn(`No se pudo eliminar la carpeta temporal: ${tempFolder}`, err.message);
    }
  }

  private async processVideo(
    inputPath: string,
    type: string,
    typeId: string,
    userId: string,
    serviceCode: string,
    storeId: string,
  ): Promise<NoteFile> {
    const { fileName, objectKey } = this.buildFileNaming({
      serviceCode,
      type,
      typeId,
      userId,
      storeId,
      extension: 'mp4',
    });
    const tempOutputPath = path.join(os.tmpdir(), `output-${fileName}`);

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-vf scale=854:-2',
            '-c:v libx264',
            '-preset ultrafast',
            '-crf 30',
            '-c:a aac',
            '-b:a 96k',
            '-movflags +faststart',
          ])
          .format('mp4')
          .on('start', (cmd) => this.logger.log('ffmpeg start - command:', cmd))
          .on('stderr', (line) => this.logger.log('ffmpeg stderr:', line))
          .on('error', (err, stdout, stderr) => {
            this.logger.error('ffmpeg error:', err.message);
            this.logger.error('ffmpeg stderr:', stderr);
            reject(new Error(`ffmpeg failed: ${err.message}`));
          })
          .on('end', () => resolve())
          .save(tempOutputPath);
      });

      const buffer = await fsp.readFile(tempOutputPath);
      await this.minioService.uploadObject(objectKey, buffer, 'video/mp4');
      const bucket = this.minioService.getBucket();

      return {
        name: fileName,
        url: `${bucket}/${objectKey}`,
        type: this.TYPE_FILE_VIDEO,
      } as NoteFile;
    } catch (err) {
      throw new InternalServerErrorException('Error processing video', err.message);
    } finally {
      await Promise.all([
        fsp.unlink(tempOutputPath).catch(() => this.logger.warn('No se pudo eliminar output temporal')),
      ]);
    }
  }

  private async processImage(
    inputPath: string,
    type: string,
    typeId: string,
    userId: string,
    serviceCode: string,
    storeId: string,
  ): Promise<NoteFile> {
    const { fileName, objectKey } = this.buildFileNaming({
      serviceCode,
      type,
      typeId,
      userId,
      storeId,
      extension: 'webp',
    });

    try {
      const buffer = await sharp(inputPath)
        .resize({ width: 1280 })
        .rotate()
        .toFormat('webp', { quality: 75 })
        .toBuffer();

      await this.minioService.uploadObject(objectKey, buffer, 'image/webp');
      const bucket = this.minioService.getBucket();

      return {
        name: fileName,
        url: `${bucket}/${objectKey}`,
        type: this.TYPE_FILE_IMAGE,
      } as NoteFile;
    } catch (err) {
      throw new InternalServerErrorException('Error processing image', err.message);
    }
  }

  private buildFileNaming({
    serviceCode,
    type,
    typeId,
    userId,
    storeId,
    extension,
  }: {
    serviceCode: string;
    type: string;
    typeId: string;
    userId: string;
    storeId: string;
    extension: string;
  }) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0'),
      now.getMilliseconds().toString().padStart(3, '0'),
    ].join('-');

    const fileName = `${dateStr}__${timeStr}__${serviceCode}.${extension}`;
    const objectKey = `uploads/${storeId}/notes/${type}/${year}/${month}/${day}/${userId}/${typeId}/${fileName}`;

    return { fileName, objectKey };
  }

  private async processNoteFiles(
    inputPath: string,
    typeFile: string,
    type: string,
    typeId: string,
    userId: string,
    serviceCode: string,
    storeId: string,
  ): Promise<NoteFile> {
    if (typeFile == this.TYPE_FILE_IMAGE) {
      return this.processImage(inputPath, type, typeId, userId, serviceCode, storeId);
    } else if (typeFile == this.TYPE_FILE_VIDEO) {
      return this.processVideo(inputPath, type, typeId, userId, serviceCode, storeId);
    } else {
      throw new BadRequestException(`Unsupported file type: ${typeFile}`);
    }
  }

  private async resolveNoteFile(body: any, inputPath: string, userId: string): Promise<NoteFile> {
    switch (body.type) {
      case this.TYPE_BUDGETS:
        throw new BadRequestException('TYPE_BUDGETS not implemented yet');

      case this.TYPE_WORKORDERS:
        throw new BadRequestException('TYPE_WORKORDERS not implemented yet');

      case this.TYPE_BUDGET_SERVICE: {
        const budgetServiceItem = await this.budgetServiceItemRepository.findById(Number(body.id));
        const budget = budgetServiceItem?.budgetItem?.budget;

        if (!budgetServiceItem || !budget)
          throw new NotFoundException(`Budget service item with ID ${body.id} not found`);

        return this.processNoteFiles(
          inputPath,
          body.typeFile,
          this.TYPE_BUDGETS,
          String(budget.id),
          userId,
          budgetServiceItem.serviceItem.code,
          body.storeId,
        );
      }

      case this.TYPE_WORKORDER_SERVICE: {
        const workorderServiceItem = await this.workorderServiceItemRepository.findById(Number(body.id));
        const workorder = workorderServiceItem?.workorderItem?.workorder;

        if (!workorderServiceItem || !workorder)
          throw new NotFoundException(`Workorder service item with ID ${body.id} not found`);

        return this.processNoteFiles(
          inputPath,
          body.typeFile,
          this.TYPE_BUDGETS,
          String(workorder.id),
          body.userId,
          workorderServiceItem.serviceItem.code,
          body.storeId,
        );
      }

      default:
        throw new BadRequestException(`Invalid type: ${body.type}`);
    }
  }
}
