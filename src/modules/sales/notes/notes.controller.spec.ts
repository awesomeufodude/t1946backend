import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository'; // Importa BudgetRepository si no lo has hecho ya
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';
import { MinioService } from 'src/infrastructure/minio/minio.service';

describe('NotesController', () => {
  let controller: NotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        Logger,
        {
          provide: NoteRepository,
          useValue: {
            createNote: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: BudgetRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue({ id: '1', name: 'Budget 1' }),
          },
        },
        {
          provide: WorkorderRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue({ id: 1, name: 'Workorder 1' }),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: BudgetServicesItemsRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: WorkorderServicesItemsRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: NoteFileRepository,
          useValue: {
            createNoteFile: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
