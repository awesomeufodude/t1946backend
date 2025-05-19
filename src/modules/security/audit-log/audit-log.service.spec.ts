import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from 'src/infrastructure/database/repositories/audit-log.repository';
import { Logger } from '@nestjs/common';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from 'src/infrastructure/database/entities/audit-log.entity';
import { faker } from '@faker-js/faker';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let auditLogRepository: AuditLogRepository;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuditLogRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
    logger = module.get<Logger>(Logger);
  });

  describe('create', () => {
    it('should create an audit log', async () => {
      const dto = new CreateAuditLogDto();
      dto.userId = faker.string.uuid();
      dto.eventTypeCode = 'LOGIN';

      const mockAuditLog: AuditLog = {
        id: 'mockId',
        userId: dto.userId,
        eventTypeCode: dto.eventTypeCode,
        createdAt: new Date(),
      };

      jest.spyOn(auditLogRepository, 'create').mockResolvedValue(mockAuditLog);
      const result = await service.create(dto);
      expect(auditLogRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuditLog);
    });

    it('should log an error if creation fails', async () => {
      const dto = new CreateAuditLogDto();
      dto.userId = faker.string.uuid();
      dto.eventTypeCode = 'LOGIN';
      const error = new Error('Database connection error');
      jest.spyOn(auditLogRepository, 'create').mockRejectedValue(error);
      jest.spyOn(logger, 'error');
      const result = await service.create(dto);

      expect(result).toBeUndefined();
      expect(auditLogRepository.create).toHaveBeenCalledWith(dto);
      expect(logger.error).toHaveBeenCalledWith(error);
    });

    it('should handle invalid data gracefully', async () => {
      const dto = new CreateAuditLogDto();
      const error = new Error('Validation failed');
      jest.spyOn(auditLogRepository, 'create').mockRejectedValue(error);
      jest.spyOn(logger, 'error');
      const result = await service.create(dto);
      expect(result).toBeUndefined();
      expect(auditLogRepository.create).toHaveBeenCalledWith(dto);
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
