import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

describe('StoresController', () => {
  let controller: StoresController;
  let userRepositoryMock: Partial<UserRepository>;
  let appointmentTimeslotRepositoryMock: Partial<AppointmentTimeslotRepository>;

  beforeEach(async () => {
    userRepositoryMock = {
      findRolesByNames: jest.fn(),
      findUsersByRoleAndStore: jest.fn(),
    };

    appointmentTimeslotRepositoryMock = {
      findAvailableSchedulingBlocksByStore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        StoresService,
        { provide: UserRepository, useValue: userRepositoryMock },
        {
          provide: AppointmentTimeslotRepository,
          useValue: appointmentTimeslotRepositoryMock,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of technicians', async () => {
    const storeId = '1';
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
        stores: [
          {
            id: '1',
            name: 'Store 1',
            address: 'Address 1',
            phone: 987654321,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        workorders: [],
        passcodeCredentials: [],
      },
    ];
    (userRepositoryMock.findRolesByNames as jest.Mock).mockResolvedValue([{ id: '1', name: 'MAESTRO' }]);
    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValue(technicians);
    const result = await controller.findTechniciansByStore(storeId);
    expect(result).toEqual({
      data: [
        {
          id: '1',
          lastname: 'Technician 1',
          name: 'Technician 1',
          rut: '12345678-9',
        },
      ],
      message: 'OK',
    });
  });

  it('should throw an error if no technicians are found', async () => {
    const storeId = '2';
    await expect(controller.findTechniciansByStore(storeId)).rejects.toThrow();
  });

  it('should return an array of users', async () => {
    const storeId = '1';
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

    (userRepositoryMock.findRolesByNames as jest.Mock).mockResolvedValue([{ id: '1', name: 'ADMIN' }]);
    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValue(users);

    const result = await controller.findUsersByStore(storeId, 'ADMIN');

    expect(result).toEqual({
      data: [
        {
          id: '1',
          lastname: 'User 1',
          name: 'User 1',
          rut: '12345678-9',
        },
      ],
      message: 'OK',
    });
  });

  it('should return an array of scheduling blocks', async () => {
    const storeId = '1';
    const businessLineId = 1;
    const date = '2021-10-10';
    const mode = 'LEAVE';

    const timeslots = [
      {
        id: '1',
        store: { id: '1' },
        businessLine: { id: 1 },
        mode: 'LEAVE',
        date: new Date('2021-10-10'),
        duration: 30,
        slots: 5,
        slotsUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (userRepositoryMock.findUsersByRoleAndStore as jest.Mock).mockResolvedValue([]);
    (appointmentTimeslotRepositoryMock.findAvailableSchedulingBlocksByStore as jest.Mock).mockResolvedValue(timeslots);

    const result = await controller.findSchedulingBlocksByStore(storeId, businessLineId, date, mode);

    expect(result).toHaveProperty('data');
    expect(result.data.blocks).toHaveLength(1);
    expect(result.data.blocks[0]).toHaveProperty('id');
    expect(result.data.blocks[0]).toHaveProperty('hour');
    expect(result.data.blocks[0]).toHaveProperty('duration');
    expect(result.data.blocks[0]).toHaveProperty('status');
  });
});
