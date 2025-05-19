import { Inject, Injectable } from '@nestjs/common';
import { AbstractRepository } from './abstract.repository';
import { DataSource } from 'typeorm';
import { NoteFile } from '../entities/note-file.entity';

@Injectable()
export class NoteFileRepository extends AbstractRepository<NoteFile> {
  constructor(@Inject('DATA_SOURCE') dataSource: DataSource) {
    super(dataSource.getRepository(NoteFile));
  }

  async createNoteFile(noteFileData: Partial<NoteFile>): Promise<NoteFile> {
    return await this.repository.save(noteFileData);
  }

  async findNoteFileById(id: number): Promise<NoteFile | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['note'],
    });
  }

  async deleteNoteFile(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getFilesByNoteId(noteId: string): Promise<NoteFile[]> {
    return await this.repository.find({
      where: { note: { id: noteId } },
      relations: ['note'],
      order: { createdAt: 'DESC' },
    });
  }
}
