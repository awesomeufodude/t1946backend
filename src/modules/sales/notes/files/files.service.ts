import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';

import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';
import { NoteFile } from 'src/infrastructure/database/entities/note-file.entity';
import { CreateFileToNoteDto } from './files.dto';

@Injectable()
export class FilesService {
  constructor(
    private readonly minioService: MinioService,
    private readonly noteFileRepository: NoteFileRepository,
    private readonly logger: Logger,
  ) {}

  async delete(fileId: number) {
    this.logger.log('Deleting file', fileId);

    const noteFile = await this.noteFileRepository.findNoteFileById(fileId);
    if (!noteFile) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }
    const bucket = this.minioService.getBucket();
    let pathToFile = noteFile.url;

    if (pathToFile.startsWith(`${bucket}/`)) {
      pathToFile = pathToFile.replace(`${bucket}/`, '');
    }

    await this.minioService.deleteObject(pathToFile);

    return await this.noteFileRepository.deleteNoteFile(fileId);
  }

  async addFilesToNote(body: CreateFileToNoteDto): Promise<NoteFile[]> {
    this.logger.log('Adding files to note', JSON.stringify(body));
    if (body.files.length === 0) throw new NotFoundException('No files to Add');
    const createdFiles: NoteFile[] = [];
    for (const file of body.files) {
      const noteFile = new NoteFile();
      noteFile.name = file.url.split('/').pop();
      noteFile.url = file.url;
      noteFile.type = file.type;
      noteFile.note = { id: body.noteId } as any;

      try {
        const savedFile = await this.noteFileRepository.create(noteFile);
        createdFiles.push(savedFile);
      } catch (error) {
        throw new InternalServerErrorException('Error creating note file', error.message);
      }
    }
    return createdFiles;
  }
}
