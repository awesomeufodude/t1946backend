import { ForbiddenException, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { RoleRepository } from 'src/infrastructure/database/repositories/role.repository';
import { AppDomain } from '../domain/app.domain';
import { AuthGuard } from './auth.guard';

function createMockPayload(scope?: AppDomain.Scopes): any {
  return {
    sub: '1',
    role: 'user',
    scope: scope || AppDomain.Scopes.TOUCH,
  };
}

function createMockContext(request: any): any {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  };
}

function createMockRoleWithPermissions(permissions: any): any {
  return {
    id: '1',
    name: 'Admin',
    permissions,
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let roleRepository: RoleRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: RoleRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the route is public', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should return true if the request token is valid', async () => {
      const context = createMockContext({
        headers: {
          authorization: 'Bearer token',
        },
        user: {
          role: '1',
        },
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload());
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(createMockRoleWithPermissions([]));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw an UnauthorizedException if the request is invalid', async () => {
      const context = createMockContext({ headers: {} });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload());

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw a ForbiddenException if the scope is invalid', async () => {
      const isPublic = false;
      const isNotAvailableInTouch = true;
      const permissionRequired = false;
      const context = createMockContext({
        headers: {
          authorization: 'Bearer token',
        },
      });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(isPublic)
        .mockReturnValueOnce(isNotAvailableInTouch)
        .mockReturnValueOnce(permissionRequired);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload());

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should return true if the scope is valid', async () => {
      const context = createMockContext({
        headers: {
          authorization: 'Bearer token',
        },
        user: {
          role: '1',
        },
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppDomain.Permissions.LIST_USERS]);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload(AppDomain.Scopes.SYSTEM));
      const permissions = [
        {
          code: AppDomain.Permissions.LIST_USERS.toString(),
          name: 'Listar Usuarios',
        },
      ];
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(createMockRoleWithPermissions(permissions));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw a ForbiddenException if the permissions are invalid', async () => {
      const isPublic = false;
      const isNotAvailableInTouch = false;
      const permissionRequired = [AppDomain.Permissions.LIST_USERS];
      const context = createMockContext({
        headers: {
          authorization: 'Bearer token',
        },
      });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(isPublic)
        .mockReturnValueOnce(isNotAvailableInTouch)
        .mockReturnValueOnce(permissionRequired);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload(AppDomain.Scopes.SYSTEM));
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(createMockRoleWithPermissions([]));

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should return true if the permissions are valid', async () => {
      const isPublic = false;
      const isNotAvailableInTouch = false;
      const permissionRequired = [AppDomain.Permissions.LIST_USERS];
      const context = createMockContext({
        headers: {
          authorization: 'Bearer token',
        },
      });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(isPublic)
        .mockReturnValueOnce(isNotAvailableInTouch)
        .mockReturnValueOnce(permissionRequired);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(createMockPayload(AppDomain.Scopes.SYSTEM));
      const permissions = [
        {
          code: AppDomain.Permissions.LIST_USERS.toString(),
          name: 'Listar Usuarios',
        },
      ];
      jest.spyOn(roleRepository, 'findById').mockResolvedValue(createMockRoleWithPermissions(permissions));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
