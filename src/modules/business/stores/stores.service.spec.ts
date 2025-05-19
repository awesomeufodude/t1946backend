import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import { StoresService } from './stores.service';

describe('StoresService', () => {
  let service: StoresService;
  let userRepositoryMock: Partial<UserRepository>;
  let appointmentTimeslotRepositoryMock: Partial<AppointmentTimeslotRepository>;
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
    };

    userRepositoryMock = {
      findRolesByNames: jest.fn(),
      findUsersByRoleAndStore: jest.fn(),
    };

    appointmentTimeslotRepositoryMock = {
      findAvailableSchedulingBlocksByStore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: Logger, useValue: mockLogger },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: AppointmentTimeslotRepository, useValue: appointmentTimeslotRepositoryMock },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of technicians', async () => {
    const storeId = 'store-123';
    const technicians = [
      {
        id: '1',
        name: 'Technician 1',
        rut: '12345678-9',
        email: 'technician1@gmail.com',
        lastname: 'Technician 1',
        role: { id: '1', name: 'MAESTRO', permissions: [], createdAt: new Date(), updatedAt: new Date() },
        passwordHash: 'hashedpassword1',
        avatarPath: '/path/to/avatar1.png',
        jobRole: 'Technician',
        phoneZone: 56,
        phoneNumber: 987654321,
        active: true,
        securityMethodTotem: SecurityDomain.SecurityMethodTotem.CODE,
        createdAt: new Date(),
        updatedAt: new Date(),
        budgetGroups: [],
        stores: [],
        workorders: [],
        passcodeCredentials: [],
      },
      {
        id: '2',
        name: 'Technician 2',
        rut: '12345678-2',
        email: 'technician2@gmail.com',
        lastname: 'Technician 2',
        role: {
          id: '2',
          name: 'MAESTRO_ALINEADOR',
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        passwordHash: 'hashedpassword2',
        avatarPath: '/path/to/avatar2.png',
        jobRole: 'Technician',
        phoneZone: 56,
        phoneNumber: 987654322,
        active: true,
        securityMethodTotem: SecurityDomain.SecurityMethodTotem.CODE,
        createdAt: new Date(),
        updatedAt: new Date(),
        budgetGroups: [],
        stores: [],
        workorders: [],
        passcodeCredentials: [],
      },
    ];

    (userRepositoryMock.findRolesByNames as jest.Mock).mockResolvedValue([{ id: '1', name: AppDomain.TECHNICIANS }]);
    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValue(technicians);

    const result = await service.findUsersByRolesAndStore(storeId, AppDomain.TECHNICIANS);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(technicians.length);
    expect(result[0]).toEqual(expect.objectContaining({ id: '1', name: 'Technician 1' }));
    expect(result[1]).toEqual(expect.objectContaining({ id: '2', name: 'Technician 2' }));
  });

  it('should throw an error if no technicians are found', async () => {
    const storeId = 'store-123';

    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockRejectedValueOnce(new Error('No technicians found'));

    await expect(service.findUsersByRolesAndStore(storeId, AppDomain.TECHNICIANS)).rejects.toThrow();
  });

  it('should return an array of users by role and store', async () => {
    const storeId = 'store-123';
    const role = 'ADMIN';
    const users = [
      {
        id: '1',
        name: 'User 1',
        rut: '12345678-9',
        email: 'user@mail.cl',
        lastname: 'User 1',
        role: { id: '1', name: 'ADMIN', permissions: [], createdAt: new Date(), updatedAt: new Date() },
        passwordHash: 'hashedpassword1',
        avatarPath: '/path/to/avatar1.png',
        jobRole: 'User',
        phoneZone: 56,
        phoneNumber: 987654321,
        active: true,
        securityMethodTotem: SecurityDomain.SecurityMethodTotem.CODE,
        createdAt: new Date(),
        updatedAt: new Date(),
        budgetGroups: [],
        stores: [],
        workorders: [],
        passcodeCredentials: [],
      },
    ];

    (userRepositoryMock.findRolesByNames as jest.Mock).mockResolvedValueOnce([{ id: '1', name: role }]);
    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValueOnce(users);

    const result = await service.findUsersByRolesAndStore(storeId, [role]);

    expect(userRepositoryMock.findRolesByNames).toHaveBeenCalledWith([role]);
    expect(userRepositoryMock.findUsersByRoleAndStore).toHaveBeenCalledWith(storeId, ['1']);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(users.length);
    expect(result[0]).toEqual(expect.objectContaining({ id: '1', name: 'User 1' }));
  });

  it('should throw an error if no users are found', async () => {
    const storeId = 'store-123';
    const role = 'ADMIN';

    (userRepositoryMock.findRolesByNames as jest.Mock).mockResolvedValueOnce([{ id: '1', name: role }]);
    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValueOnce([]);

    await expect(service.findUsersByRolesAndStore(storeId, [role])).rejects.toThrow();
  });

  it('should return an array of scheduling blocks by store', async () => {
    const storeId = 'store-123';
    const businessLineId = 1;
    const date = '2021-06-01';
    const mode = 'LEAVE';
    const timeslots = [
      {
        id: '1',
        store: { id: '1' },
        businessLine: { id: 1 },
        mode: 'LEAVE',
        date: new Date('2021-06-01T09:00:00'),
        duration: 30,
        slots: 5,
        slotsUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (appointmentTimeslotRepositoryMock.findAvailableSchedulingBlocksByStore as jest.Mock).mockResolvedValue(timeslots);

    const result = await service.findSchedulingBlocksByStore(storeId, businessLineId, date, mode);

    expect(result).toHaveProperty('blocks');
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]).toHaveProperty('id');
    expect(result.blocks[0]).toHaveProperty('hour');
    expect(result.blocks[0]).toHaveProperty('duration');
    expect(result.blocks[0]).toHaveProperty('status');
  });

  it('should return an empty array if no scheduling blocks are found', async () => {
    const storeId = 'store-123';
    const businessLineId = 1;
    const date = '2021-06-01';
    const mode = 'LEAVE';

    (appointmentTimeslotRepositoryMock.findAvailableSchedulingBlocksByStore as jest.Mock).mockResolvedValue([]);

    await expect(service.findSchedulingBlocksByStore(storeId, businessLineId, date, mode)).resolves.toEqual({
      blocks: [],
    });
  });
});
