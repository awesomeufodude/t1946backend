import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Note } from '../entities/note.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class NoteRepository extends AbstractRepository<Note> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Note));
  }

  async createNote(noteData: Partial<Note>): Promise<Note> {
    return await this.repository.save(noteData);
  }

  async deleteNoteById(noteId: string): Promise<void> {
    await this.repository.delete(noteId);
  }

  async updateNoteById(noteId: string, noteData: Partial<Note>): Promise<Note> {
    return await this.repository.save({ id: noteId, ...noteData });
  }

  async getNotesByBudgetId(budgetId: string, orderBy: 'ASC' | 'DESC' = 'DESC'): Promise<Note[]> {
    this.logger.log('Finding notes by budgetId');
    try {
      return await this.repository.find({
        where: { budget: { id: budgetId } },
        relations: ['budget', 'createdBy'],
        order: { createdAt: orderBy },
      });
    } catch (error) {
      this.logger.error('Error finding notes by budgetId');
      throw error;
    }
  }

  async getNotesByWorkorderId(workOrderId: number, orderBy: 'ASC' | 'DESC' = 'DESC') {
    this.logger.log('Finding notes by workorderId');
    try {
      return await this.repository.find({
        where: {
          workorder: {
            id: workOrderId,
          },
        },
        order: { createdAt: orderBy },
        relations: ['workorder', 'createdBy'],
      });
    } catch (error) {
      this.logger.error('Error finding notes by workorderId');
      throw error;
    }
  }

  async getNotesByBudgetServiceItemId(budgetServiceItemId: number, orderBy: 'ASC' | 'DESC' = 'DESC'): Promise<Note[]> {
    this.logger.log('Finding notes by budgetId');
    try {
      const notes = await this.repository.find({
        where: { budgetServiceItem: { id: budgetServiceItemId } },
        relations: ['budget', 'createdBy', 'files'],
        order: { createdAt: orderBy },
      });
      for (const note of notes) {
        note.files.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      return notes;
    } catch (error) {
      this.logger.error('Error finding notes by budgetServiceItemId');
      throw error;
    }
  }
  async getNotesByWorkOrderServiceItemId(
    workOrderServiceItemId: number,
    orderBy: 'ASC' | 'DESC' = 'DESC',
  ): Promise<Note[]> {
    this.logger.log('Finding notes by budgetId');
    try {
      const notes = await this.repository.find({
        where: { workorderServiceItem: { id: workOrderServiceItemId } },
        relations: ['workorder', 'createdBy', 'files'],
        order: { createdAt: orderBy },
      });

      for (const note of notes) {
        note.files.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      return notes;
    } catch (error) {
      this.logger.error('Error finding notes by workOrderServiceItemId');
      throw error;
    }
  }
}
