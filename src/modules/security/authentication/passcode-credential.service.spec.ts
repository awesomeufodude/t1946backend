import { Test, TestingModule } from '@nestjs/testing';
import { PasscodeCredentialService } from './passcode-credential.service';
import { PassCodeCredentialRepository } from 'src/infrastructure/database/repositories/passcode-credential.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import HashingUtils from 'src/shared/utils/hashing.utils';
import { PasscodeCredential } from '../../../infrastructure/database/entities/passcode-credential.entity';
import { faker } from '@faker-js/faker';

describe('PasscodeCredentialService', () => {
  let service: PasscodeCredentialService;

  const mockPassCodeCredentialRepository = {
    findOnePasscodeCredential: jest.fn(),
    findOnePasscodeCredentialByStoreAndUser: jest.fn(),
    createPasscodeCredential: jest.fn(),
    save: jest.fn(),
  };

  const mockStoreId = faker.string.uuid();
  const mockUserId = faker.string.uuid();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasscodeCredentialService,
        {
          provide: PassCodeCredentialRepository,
          useValue: mockPassCodeCredentialRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PasscodeCredentialService>(PasscodeCredentialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isCodeUnique', () => {
    beforeEach(() => {
      jest.spyOn(HashingUtils, 'hash').mockResolvedValue('hashedCode');
    });

    it('should return true if the code is unique', async () => {
      mockPassCodeCredentialRepository.findOnePasscodeCredential.mockResolvedValue(null);

      const result = await service.isCodeUnique(12345, mockStoreId);
      expect(result).toBe(true);
    });

    it('should return false if the code is not unique', async () => {
      mockPassCodeCredentialRepository.findOnePasscodeCredential.mockResolvedValue({});

      const result = await service.isCodeUnique(12345, mockStoreId);
      expect(result).toBe(false);
    });
  });

  describe('generateUniqueCode', () => {
    beforeEach(() => {
      jest.spyOn(HashingUtils, 'hash').mockResolvedValue('hashedCode');
      jest.spyOn(service, 'isCodeUnique').mockResolvedValue(true);
    });

    it('should generate a unique code and create a new record if it does not exist', async () => {
      mockPassCodeCredentialRepository.findOnePasscodeCredentialByStoreAndUser.mockResolvedValue(null);
      mockPassCodeCredentialRepository.createPasscodeCredential.mockResolvedValue({});

      const code = await service.generateUniqueCode(mockStoreId, mockUserId);

      expect(code).toBeDefined();
      expect(mockPassCodeCredentialRepository.createPasscodeCredential).toHaveBeenCalledWith(
        code,
        mockStoreId,
        mockUserId,
      );
    });

    it('should update the passcode if the record exists', async () => {
      const existingPasscodeCredential = new PasscodeCredential();
      jest.spyOn(service as any, 'update').mockResolvedValue(undefined);
      mockPassCodeCredentialRepository.findOnePasscodeCredentialByStoreAndUser.mockResolvedValue(
        existingPasscodeCredential,
      );

      const code = await service.generateUniqueCode(mockStoreId, mockUserId);

      expect(code).toBeDefined();
      expect((service as any)['update']).toHaveBeenCalledWith(code, existingPasscodeCredential);
    });

    it('should throw an error if a unique code cannot be generated', async () => {
      jest.spyOn(service, 'isCodeUnique').mockResolvedValue(false);

      await expect(service.generateUniqueCode(mockStoreId, mockUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyCode', () => {
    beforeEach(() => {
      jest.spyOn(HashingUtils, 'hash').mockResolvedValue('hashedCode');
    });

    it('should return the passcode credential if the code is found', async () => {
      const existingPasscodeCredential = new PasscodeCredential();
      mockPassCodeCredentialRepository.findOnePasscodeCredential.mockResolvedValue(existingPasscodeCredential);

      const result = await service.verifyCode(12345, mockStoreId, null);

      expect(result).toBe(existingPasscodeCredential);
    });

    it('should return null if the code is not found', async () => {
      mockPassCodeCredentialRepository.findOnePasscodeCredential.mockResolvedValue(null);

      const result = await service.verifyCode(12345, mockStoreId, null);

      expect(result).toBeNull();
    });
  });

  describe('getUniqueCode', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'generateRandomCode').mockReturnValue(12345);
      jest.spyOn(service, 'isCodeUnique').mockResolvedValue(true);
    });

    it('should return a unique code if found within 10 attempts', async () => {
      const code = await (service as any)['getUniqueCode'](false, mockStoreId);

      expect(code).toBe(12345);
    });

    it('should throw an error if a unique code is not found within 10 attempts', async () => {
      jest.spyOn(service, 'isCodeUnique').mockResolvedValue(false);

      await expect((service as any)['getUniqueCode'](false, mockStoreId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    it('should call the repository to create a new passcode credential', async () => {
      await (service as any)['create'](12345, mockStoreId, mockUserId);

      expect(mockPassCodeCredentialRepository.createPasscodeCredential).toHaveBeenCalledWith(
        12345,
        mockStoreId,
        mockUserId,
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(HashingUtils, 'hash').mockResolvedValue('hashedCode');
    });

    it('should update the passcode credential with the new code and expiry date', async () => {
      const passcodeCredential = new PasscodeCredential();
      await (service as any)['update'](12345, passcodeCredential);

      expect(passcodeCredential.passcodeHash).toBe('hashedCode');
      expect(passcodeCredential.expiresAt).toBeDefined();
      expect(mockPassCodeCredentialRepository.save).toHaveBeenCalledWith(passcodeCredential);
    });
  });
});
