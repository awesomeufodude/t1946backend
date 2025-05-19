import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { UserDto } from './users.dto';
import { UsersService } from './users.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { AuditLogService } from 'src/modules/security/audit-log/audit-log.service';

export function createMockUser(): User {
  const user = new User();

  user.id = '1a2b3c4d-5e6f-7g8h-9i0j-a1b2c3d4e5f6';
  user.rut = faker.number.int({ min: 10000000, max: 99999999 }) + '-K';
  user.name = faker.person.firstName();
  user.lastname = faker.person.lastName();
  user.email = faker.internet.email();
  const password = faker.internet.password();
  user.passwordHash = bcrypt.hashSync(password, 10);

  user.jobRole = faker.person.jobTitle();
  user.role = null;
  user.phoneZone = faker.number.int({ min: 1, max: 99 });
  user.phoneNumber = faker.number.int({ min: 9000000, max: 9999999 });
  user.active = faker.datatype.boolean();
  user.createdAt = faker.date.past();
  user.updatedAt = faker.date.recent();

  return user;
}

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  const mockRequest = { user: { sub: faker.string.uuid() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: AuditLogService,
          useValue: {
            createAuditLog: jest.fn(),
          },
        },

        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findByRut: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of UserDto', async () => {
      const mockUsers: User[] = [createMockUser(), createMockUser()];
      jest.spyOn(userRepository, 'findAll').mockResolvedValue(mockUsers);

      const result = await service.findAll(mockRequest);

      expect(result).toEqual(plainToInstance(UserDto, mockUsers));
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('should return an empty array when no users are found', async () => {
      jest.spyOn(userRepository, 'findAll').mockResolvedValue([]);

      const result = await service.findAll(mockRequest);

      expect(result).toEqual([]);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByRut', () => {
    it('should return a UserDto when a user is found', async () => {
      const mockUser: User = createMockUser();
      jest.spyOn(userRepository, 'findByRut').mockResolvedValue(mockUser);

      const result = await service.findByRut('12345678-9');

      expect(result).toEqual(plainToInstance(UserDto, mockUser));
      expect(userRepository.findByRut).toHaveBeenCalledWith('12345678-9');
    });
    it('should return null when no user is found', async () => {
      jest.spyOn(userRepository, 'findByRut').mockResolvedValue(null);

      const result = await service.findByRut('12345678-9');

      expect(result).toBeNull();
      expect(userRepository.findByRut).toHaveBeenCalledWith('12345678-9');
    });
  });
});
