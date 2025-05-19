import { faker } from '@faker-js/faker';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { PasscodeCredential } from 'src/infrastructure/database/entities/passcode-credential.entity';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { EmailService } from 'src/infrastructure/email/email.service';
import { UserDto } from 'src/modules/admin/users/users.dto';
import { AppDomain } from 'src/shared/domain/app.domain';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LoginRequestDto } from './authentication.dto';
import { AuthenticationService } from './authentication.service';
import { PasscodeCredentialService } from './passcode-credential.service';
import { SessionCodeRequestDto } from './session-code-dto';

export function createMockUserWithLoginRequestDto(loginRequest: LoginRequestDto): User {
  const user = new User();

  user.id = faker.string.uuid();
  user.rut = faker.number.int({ min: 10000000, max: 99999999 }) + '-K';
  user.name = faker.person.firstName();
  user.lastname = faker.person.lastName();
  user.email = loginRequest.email;

  user.passwordHash = bcrypt.hashSync(loginRequest.password, 10);

  user.jobRole = faker.person.jobTitle();
  user.role = new Role();
  user.role.id = faker.string.uuid();
  user.phoneZone = faker.number.int({ min: 1, max: 99 });
  user.phoneNumber = faker.number.int({ min: 9000000, max: 9999999 });
  user.active = faker.datatype.boolean();
  user.createdAt = faker.date.past();
  user.updatedAt = faker.date.recent();
  user.budgetGroups = [];
  user.stores = [];

  return user;
}

export const mockStore = {
  id: faker.string.uuid(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  users: [],
  passcodeCredentials: [],
  budgetGroups: [],
  workorders: [],
  stocks: [],
  productPrices: [],
};

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let passcodeCredentialService: PasscodeCredentialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            createAuditLog: jest.fn(),
          },
        },
        {
          provide: PasscodeCredentialService,
          useValue: {
            generateUniqueCode: jest.fn(),
            verifyCode: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    passcodeCredentialService = module.get<PasscodeCredentialService>(PasscodeCredentialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an AppDomain.Session when a user is found', async () => {
      const loginRequest: LoginRequestDto = {
        email: 'daniel@daniel.cl',
        password: 'password',
        scope: 'TOUCH',
      };
      const mockUser: User = createMockUserWithLoginRequestDto(loginRequest);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.login(loginRequest);

      const expected: AppDomain.Session = {
        accessToken: 'token',
        user: mockUser,
      };
      expect(expected.accessToken).toEqual(result.accessToken);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginRequest.email);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('sessionCode', () => {
    it('should handle the "ask" operation successfully', async () => {
      const sessionCodeRequest: SessionCodeRequestDto = {
        operation: 'ask',
        email: 'test@borealis.cl',
        storeId: faker.string.uuid(),
      };

      const mockUser: User = {
        ...createMockUserWithLoginRequestDto({ email: 'test@borealis.cl', password: 'password', scope: 'TOUCH' }),
        stores: [mockStore],
      };

      jest.spyOn(service as any, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'generateSessionCode').mockResolvedValue(123456);
      jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

      const result = await service.sessionCode(sessionCodeRequest);

      expect(result).toEqual(mockUser.email);
      expect(service['validateUser']).toHaveBeenCalledWith(sessionCodeRequest.email, sessionCodeRequest.storeId);
      expect(service['generateSessionCode']).toHaveBeenCalledWith(sessionCodeRequest.storeId, mockUser.id);
      expect(service['sendEmail']).toHaveBeenCalledWith(mockUser, 123456);
    });

    it('should handle the "verify" operation successfully', async () => {
      const sessionCodeRequest: SessionCodeRequestDto = {
        operation: 'verify',
        code: 123456,
        storeId: faker.string.uuid(),
        email: 'test@borealis.cl',
      };

      const mockUser: User = createMockUserWithLoginRequestDto({
        email: 'test@borealis.cl',
        password: 'password',
        scope: 'TOUCH',
      });

      const mockPasscodeCredential: PasscodeCredential = {
        id: faker.string.uuid(),
        passcodeHash: faker.string.alphanumeric(20),
        expiresAt: faker.date.future(),
        store: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          address: faker.location.streetAddress(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          users: [],
          passcodeCredentials: [],
          budgetGroups: [],
          workorders: [],
          stocks: [],
          productPrices: [],
        },
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        user: mockUser,
      };

      jest.spyOn(passcodeCredentialService, 'verifyCode').mockResolvedValue(mockPasscodeCredential);
      jest.spyOn(service as any, 'createAccessToken').mockResolvedValue('validToken');

      const result = await service.sessionCode(sessionCodeRequest);

      const expectedSession: AppDomain.Session = {
        accessToken: 'validToken',
        user: plainToInstance(UserDto, mockUser),
      };

      expect((result as AppDomain.Session).accessToken).toEqual(expectedSession.accessToken);
      expect(passcodeCredentialService.verifyCode).toHaveBeenCalledWith(
        sessionCodeRequest.code,
        sessionCodeRequest.storeId,
        sessionCodeRequest.email,
      );
    });

    it('should throw InternalServerErrorException when an error occurs', async () => {
      const sessionCodeRequest: SessionCodeRequestDto = {
        operation: 'invalidOperation',
        email: 'test@borealis.cl',
        storeId: faker.string.uuid(),
      };

      await expect(service.sessionCode(sessionCodeRequest)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
