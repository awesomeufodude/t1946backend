import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UploadDto } from './upload.dto';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: UploadsService;

  const mockUploadsService = {
    assembleAndQueue: jest.fn(),
    getUploadStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadChunk', () => {
    const mockRequest = { user: { sub: 'user123' } };
    const mockChunk = { buffer: Buffer.from('data') } as Express.Multer.File;
    const baseBody: UploadDto = {
      fileId: 'file123',
      chunkIndex: '0',
      totalChunks: '2',
      originalName: 'video.mp4',
      storeId: 'store001',
      type: 'image',
      id: 'upload001',
      typeFile: 'budget_service',
    };

    it('should throw BadRequestException if any required field is missing', async () => {
      await expect(controller.uploadChunk(mockRequest, null, baseBody)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadChunk(mockRequest, mockChunk, {} as any)).rejects.toThrow(BadRequestException);
    });

    it('should store the chunk and call assembleAndQueue if all chunks uploaded', async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['chunk_0', 'chunk_1']);

      await controller.uploadChunk(mockRequest, mockChunk, baseBody);

      expect(fs.promises.mkdir).toHaveBeenCalledWith('/app/tmp/uploads/file123', { recursive: true });
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join('/app/tmp/uploads/file123', 'chunk_0'),
        mockChunk.buffer,
      );
      expect(service.assembleAndQueue).toHaveBeenCalledWith('file123', 2, 'video.mp4', baseBody, 'user123');
    });

    it('should store the chunk but not call assembleAndQueue if not all chunks received', async () => {
      (fs.promises.readdir as jest.Mock).mockResolvedValue(['chunk_0']);

      await controller.uploadChunk(mockRequest, mockChunk, baseBody);

      expect(service.assembleAndQueue).not.toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return status if found', async () => {
      const mockStatus = { progress: 50 };
      mockUploadsService.getUploadStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus('file123');

      expect(result).toEqual(new SuccessResponseDto(mockStatus));
    });

    it('should throw NotFoundException if status not found', async () => {
      mockUploadsService.getUploadStatus.mockResolvedValue(null);
      await expect(controller.getStatus('file123')).rejects.toThrow(NotFoundException);
    });
  });
});
