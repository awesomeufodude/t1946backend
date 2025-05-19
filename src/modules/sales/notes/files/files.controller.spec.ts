import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CreateFileToNoteDto } from './files.dto';
import { Logger } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockFilesService = {
    delete: jest.fn(),
    addFilesToNote: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFile', () => {
    it('should return SuccessResponseDto after deleting a file', async () => {
      const mockFileId = 123;
      const mockResponse = { deleted: true };

      mockFilesService.delete.mockResolvedValue(mockResponse);

      const result = await controller.deleteFile(mockFileId);

      expect(service.delete).toHaveBeenCalledWith(mockFileId);
      expect(result).toEqual(new SuccessResponseDto(mockResponse));
    });
  });

  describe('addFilesToNote', () => {
    it('should return SuccessResponseDto after adding files to note', async () => {
      const mockDto: CreateFileToNoteDto = {
        noteId: '123',
        files: [
          {
            url: 'http://example.com/file1.jpg',
            type: 'image',
          },
        ],
      };

      const mockResult = { added: true };
      mockFilesService.addFilesToNote.mockResolvedValue(mockResult);

      const result = await controller.addFilesToNote(mockDto);

      expect(service.addFilesToNote).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(new SuccessResponseDto(mockResult));
    });
  });
});
