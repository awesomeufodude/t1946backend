import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { NoteFileRepository } from 'src/infrastructure/database/repositories/note.file.repository';
import { NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { NoteFile } from 'src/infrastructure/database/entities/note-file.entity';
import { CreateFileToNoteDto } from './files.dto';

describe('FilesService', () => {
  let service: FilesService;
  let minioService: MinioService;

  const mockMinioService = {
    getBucket: jest.fn().mockReturnValue('test-bucket'),
    deleteObject: jest.fn(),
  };

  const mockNoteFileRepository = {
    findNoteFileById: jest.fn(),
    deleteNoteFile: jest.fn(),
    getFilesByNoteId: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: MinioService, useValue: mockMinioService },
        { provide: NoteFileRepository, useValue: mockNoteFileRepository },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    minioService = module.get<MinioService>(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    it('should throw NotFoundException if file is not found', async () => {
      mockNoteFileRepository.findNoteFileById.mockResolvedValue(null);
      await expect(service.delete(123)).rejects.toThrow(NotFoundException);
    });

    it('should delete file from bucket and database', async () => {
      const fileId = 123;
      const mockFile: NoteFile = {
        id: fileId,
        url: 'test-bucket/uploads/file.mp4',
        name: 'file.mp4',
        type: 'video',
        note: { id: 1 } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNoteFileRepository.findNoteFileById.mockResolvedValue(mockFile);
      mockNoteFileRepository.deleteNoteFile.mockResolvedValue(undefined);

      const result = await service.delete(fileId);

      expect(minioService.deleteObject).toHaveBeenCalledWith('uploads/file.mp4');
      expect(mockNoteFileRepository.deleteNoteFile).toHaveBeenCalledWith(fileId);
      expect(result).toBeUndefined();
    });
  });

  describe('addFilesToNote', () => {
    it('should throw NotFoundException if files array is empty', async () => {
      await expect(service.addFilesToNote({ noteId: '1', files: [] })).rejects.toThrow(NotFoundException);
    });

    it('should create and return NoteFile[] if files are valid', async () => {
      const body: CreateFileToNoteDto = {
        noteId: '1',
        files: [
          {
            url: 'http://example.com/file1.jpg',
            type: 'image',
          },
        ],
      };

      const mockNoteFile = {
        id: 1,
        name: 'file1.jpg',
        url: 'http://example.com/file1.jpg',
        type: 'image',
        note: { id: '1' },
      } as NoteFile;

      mockNoteFileRepository.create.mockResolvedValue(mockNoteFile);

      const result = await service.addFilesToNote(body);

      expect(mockNoteFileRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockNoteFile]);
    });

    it('should throw InternalServerErrorException if repository.create fails', async () => {
      const body: CreateFileToNoteDto = {
        noteId: '1',
        files: [
          {
            url: 'http://example.com/file1.jpg',
            type: 'image',
          },
        ],
      };

      mockNoteFileRepository.create.mockRejectedValue(new InternalServerErrorException('DB error'));

      await expect(service.addFilesToNote(body)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
