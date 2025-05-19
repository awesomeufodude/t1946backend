import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRepository } from 'src/infrastructure/database/repositories/budget.repository'; // Importa el BudgetRepository
import { NoteRepository } from 'src/infrastructure/database/repositories/note.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { NoteResponseDto } from './notes.dto';
import { NotesService } from './notes.service';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';
import { MinioService } from 'src/infrastructure/minio/minio.service';

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: NoteRepository;
  let budgetRepository: BudgetRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: NoteRepository,
          useValue: {
            createNote: jest.fn(),
            getNotesByBudgetId: jest.fn(),
          },
        },
        {
          provide: BudgetRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WorkorderRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
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
            createNoteFile: jest.fn(),
            getNoteFileById: jest.fn(),
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
        Logger,
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    notesRepository = module.get<NoteRepository>(NoteRepository);
    budgetRepository = module.get<BudgetRepository>(BudgetRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNote', () => {
    it('should create a note successfully for budgets', async () => {
      const type = 'budgets';
      const id = '97-1';
      const text = 'Test note';

      const userId = '3277a1b8-eced-4f88-bab3-0b421ecf7375';

      const mockBudget = {
        id,
        budgetGroup: {
          createdBy: {
            id: '3277a1b8-eced-4f88-bab3-0b421ecf7375',
            name: 'Bryan',
            lastname: 'Inostroza',
            rut: '88888888-8',
          },
        },
      };

      const mockNote = {
        id: '123',
        text: 'Test note',
        step: 'Presupuesto',
        budget: mockBudget,
        createdBy: {
          id: '3277a1b8-eced-4f88-bab3-0b421ecf7375',
          name: 'Bryan',
          lastname: 'Inostroza',
          rut: '88888888-8',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      budgetRepository.findById = jest.fn().mockResolvedValue(mockBudget);
      notesRepository.createNote = jest.fn().mockResolvedValue(mockNote);

      const result = await service.createNote(type, id, userId, {
        content: text,
        step: 'Presupuesto',
        files: [],
      });

      expect(budgetRepository.findById).toHaveBeenCalledWith(id);
      expect(notesRepository.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          text: text,
          budget: mockBudget,
        }),
      );

      expect(result).toEqual(
        new NoteResponseDto({
          id: mockNote.id,
          budgetId: id,
          text: text,
          step: 'Presupuesto',
          budget: mockBudget,
          createdBy: {
            id: mockBudget.budgetGroup.createdBy.id,
            name: mockBudget.budgetGroup.createdBy.name,
            lastname: mockBudget.budgetGroup.createdBy.lastname,
            rut: mockBudget.budgetGroup.createdBy.rut,
          },
          createdAt: mockNote.createdAt,
          updatedAt: mockNote.updatedAt,
        }),
      );
    });

    it('should throw an error if type is invalid', async () => {
      const type = 'invalidType';
      const id = '97-1';
      const body = { content: 'Invalid test note', step: 'Presupuesto', files: [] };
      const userId = '3277a1b8-eced-4f88-bab3-0b421ecf7375';

      await expect(service.createNote(type, id, userId, body)).rejects.toThrow('Invalid type');
    });
  });

  describe('getNotes', () => {
    it('should return notes for budgets', async () => {
      const type = 'budgets';
      const id = '78';

      const mockNotes = [
        {
          id: '1',
          text: 'Note 1',
          workorderId: null,
          createdAt: new Date(),
          createdBy: {
            id: '3277a1b8-eced-4f88-bab3-0b421ecf7375',
            name: 'Bryan',
            lastname: 'Inostroza',
            rut: '12345678-9',
          },
        },
        {
          id: '2',
          text: 'Note 2',
          workorderId: null,
          createdAt: new Date(),
          createdBy: {
            id: '3277a1b8-eced-4f88-bab3-0b421ecf7375',
            name: 'Bryan',
            lastname: 'Inostroza',
            rut: '12345678-9',
          },
        },
      ];

      userRepository.findById = jest.fn().mockResolvedValue({
        id: '3277a1b8-eced-4f88-bab3-0b421ecf7375',
        name: 'Bryan',
        lastname: 'Inostroza',
        rut: '12345678-9',
      });
      notesRepository.getNotesByBudgetId = jest.fn().mockResolvedValue(mockNotes);

      service['addCreatedByBudgetId'] = jest.fn().mockResolvedValue({
        id: '123',
        name: 'John',
        lastname: 'Doe',
      });

      const result = await service.getNotes(type, id);

      expect(result).toEqual(
        mockNotes.map(
          (note) =>
            new NoteResponseDto({
              ...note,
              createdAt: note.createdAt,
            }),
        ),
      );
      expect(notesRepository.getNotesByBudgetId).toHaveBeenCalledWith(id);
    });

    it('should throw an error if type is invalid', async () => {
      const type = 'invalidType';
      const id = '1';

      await expect(service.getNotes(type, id)).rejects.toThrow('Invalid type');
    });
  });
});
