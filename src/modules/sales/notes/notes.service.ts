import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Note } from 'src/infrastructure/database/entities/note.entity';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository';
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { CreateNoteDto, FilesDto, NoteResponseDto } from './notes.dto';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { NoteFile } from 'src/infrastructure/database/entities/note-file.entity';
import sharp from 'sharp';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';

ffmpeg.setFfmpegPath(ffmpegStatic);

@Injectable()
export class NotesService {
  private readonly TYPE_WORKORDERS = 'workorders';
  private readonly TYPE_BUDGETS = 'budgets';
  private readonly TYPE_BUDGET_SERVICE = 'budget_service';
  private readonly TYPE_WORKORDER_SERVICE = 'workorder_service';

  private notes: Note[] = [];
  constructor(
    private readonly logger: Logger,
    private readonly notesRepository: NoteRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly workorderRepository: WorkorderRepository,
    private readonly userRepository: UserRepository,
    private readonly budgetServiceItemRepository: BudgetServicesItemsRepository,
    private readonly workorderServiceItemRepository: WorkorderServicesItemsRepository,
    private readonly minioService: MinioService,
    private readonly noteFileRepository: NoteFileRepository,
  ) {}

  async createNote(type: string, id: string, userId: string, body: CreateNoteDto) {
    this.validateType(type);
    this.logger.log('createNote', JSON.stringify(body, null, 2));
    const noteData = new Note();
    noteData.text = body.content;
    noteData.step = body.step;
    noteData.createdBy = await this.userRepository.findById(userId);

    switch (type) {
      case this.TYPE_BUDGETS: {
        const budget = await this.budgetRepository.findById(id);
        if (!budget) throw new NotFoundException(`Budget with ID ${id} not found`);
        noteData.budget = budget;
        break;
      }
      case this.TYPE_WORKORDERS: {
        const workorder = await this.workorderRepository.findById(Number(id));
        if (!workorder) throw new NotFoundException(`Workorder with ID ${id} not found`);
        noteData.workorder = workorder;
        break;
      }
      case this.TYPE_BUDGET_SERVICE: {
        const budgetServiceItem = await this.budgetServiceItemRepository.findById(Number(id));
        const budget = budgetServiceItem.budgetItem.budget;
        if (!budgetServiceItem || !budget) throw new NotFoundException(`Budget service item with ID ${id} not found`);

        noteData.budgetServiceItem = budgetServiceItem;
        break;
      }
      case this.TYPE_WORKORDER_SERVICE: {
        const workorderServiceItem = await this.workorderServiceItemRepository.findById(Number(id));
        const workorder = workorderServiceItem?.workorderItem?.workorder;
        if (!workorderServiceItem || !workorder)
          throw new NotFoundException(`Workorder service item with ID ${id} not found`);

        noteData.workorderServiceItem = workorderServiceItem;
        break;
      }

      default:
        throw new BadRequestException(`Invalid type: ${type}`);
    }

    const newNote = await this.notesRepository.createNote(noteData);
    if (body.files.length > 0) {
      const createdFiles = await this.createNoteFiles(body.files, newNote);
      newNote.files = createdFiles;
    }

    return new NoteResponseDto(newNote);
  }

  async getNotes(type: string, id: string): Promise<NoteResponseDto[]> {
    this.validateType(type);
    if (type === this.TYPE_WORKORDERS) {
      this.notes = await this.notesRepository.getNotesByWorkorderId(Number(id));
    } else if (type === this.TYPE_BUDGETS) {
      this.notes = await this.notesRepository.getNotesByBudgetId(id);
    } else if (type == this.TYPE_BUDGET_SERVICE) {
      this.notes = await this.notesRepository.getNotesByBudgetServiceItemId(Number(id));
    } else if (type == this.TYPE_WORKORDER_SERVICE) {
      this.notes = await this.notesRepository.getNotesByWorkOrderServiceItemId(Number(id));
    } else {
      throw new BadRequestException(`Invalid type: ${type}`);
    }
    return this.notes.map((note) => new NoteResponseDto(note));
  }

  private validateType(type: string): void {
    const validTypes = ['workorders', 'budgets', 'budget_service', 'workorder_service'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(`Invalid type '${type}'. Expected one of: ${validTypes.join(', ')}`);
    }
  }

  private async processNoteFiles(
    files: Express.Multer.File[],
    type: string,
    typeId: string,
    userId: string,
    service,
    storeId?: string,
  ): Promise<NoteFile[]> {
    const processedFiles: NoteFile[] = [];
    for (const file of files) {
      if (file.mimetype.startsWith('image')) {
        const image = await this.processImage(file, type, typeId, userId, service, storeId);
        processedFiles.push(image);
      } else if (file.mimetype.startsWith('video')) {
        const video = await this.processVideo(file, type, typeId, userId, service, storeId);
        processedFiles.push(video);
      } else {
        throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
      }
    }
    return processedFiles;
  }

  private async processImage(
    file: Express.Multer.File,
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
      const buffer = await sharp(file.buffer)
        .resize({ width: 1280 })
        .rotate()
        .toFormat('webp', { quality: 75 })
        .toBuffer();

      await this.minioService.uploadObject(objectKey, buffer, 'image/webp');
      const bucket = this.minioService.getBucket();

      return {
        name: fileName,
        url: `${bucket}/${objectKey}`,
        type: 'image',
      } as NoteFile;
    } catch (err) {
      throw new InternalServerErrorException('Error processing image', err.message);
    }
  }

  private async processVideo(
    file: Express.Multer.File,
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

    const tempInputPath = path.join(os.tmpdir(), `input-${fileName}`);
    const tempOutputPath = path.join(os.tmpdir(), `output-${fileName}`);

    try {
      await fs.writeFile(tempInputPath, file.buffer);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .outputOptions([
            '-vf scale=1280:-2',
            '-c:v libx264',
            '-preset fast',
            '-crf 28',
            '-c:a aac',
            '-b:a 128k',
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

      const buffer = await fs.readFile(tempOutputPath);
      await this.minioService.uploadObject(objectKey, buffer, 'video/mp4');
      const bucket = this.minioService.getBucket();
      return {
        name: fileName,
        url: `${bucket}/${objectKey}`,
        type: 'video',
      } as NoteFile;
    } catch (err) {
      throw new InternalServerErrorException('Error processing video', err.message);
    } finally {
      await Promise.all([
        fs.unlink(tempInputPath).catch(() => this.logger.warn('No se pudo eliminar input temporal')),
        fs.unlink(tempOutputPath).catch(() => this.logger.warn('No se pudo eliminar output temporal')),
      ]);
    }
  }

  private async createNoteFiles(filesUrl: FilesDto[], newNote: Note) {
    if (!Array.isArray(filesUrl) || filesUrl.length === 0) return;
    const createdFiles: NoteFile[] = [];
    for (const file of filesUrl) {
      const noteFile = new NoteFile();
      noteFile.name = file.url.split('/').pop();
      noteFile.url = file.url;
      noteFile.type = file.type;
      noteFile.note = newNote;

      try {
        const savedFile = await this.noteFileRepository.create(noteFile);
        createdFiles.push(savedFile);
      } catch (error) {
        throw new InternalServerErrorException('Error creating note file', error.message);
      }
    }
    return createdFiles;
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
}
