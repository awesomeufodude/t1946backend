import { AppDomain } from 'src/shared/domain/app.domain';
import HashingUtils from 'src/shared/utils/hashing.utils';
import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Module } from '../entities/module.entity';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Store } from '../entities/store.entity';

export class UsersSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const moduleRepository = dataSource.getRepository(Module);
    const pemissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);
    const storeRepository = dataSource.getRepository(Store);
    const userRepository = dataSource.getRepository(User);

    // Load modules
    const modules = await this.loadModules();
    await moduleRepository.upsert(modules, ['code']);

    // Load permissions
    const permissions = await this.loadPermissions(modules, pemissionRepository);
    await pemissionRepository.upsert(permissions, ['code']);

    // Load roles
    const roles = await this.loadRoles(permissions, roleRepository);
    await roleRepository.save(roles);

    // Load stores
    const stores = await this.loadStores();
    await storeRepository.upsert(stores, ['id']);

    // Load users
    const users = await this.loadUsers(roles, stores, userRepository);
    await userRepository.save(users);
  }

  private async loadModules(): Promise<Module[]> {
    const moduleList = [
      {
        code: AppDomain.Modules.ADMINISTRATION,
        name: 'Administración del Sistema',
      },
      {
        code: AppDomain.Modules.OPERATIONAL,
        name: 'Módulo Operacional',
      },
      {
        code: AppDomain.Modules.REPORTS,
        name: 'Módulo Reportes',
      },
    ];

    const modules = moduleList.map((moduleList) => {
      const module = new Module();
      module.code = moduleList.code;
      module.name = moduleList.name;
      return module;
    });
    return modules;
  }

  private async loadPermissions(modules: Module[], permissionRepository): Promise<Permission[]> {
    const modulePermissionsList = [
      {
        code: AppDomain.Modules.ADMINISTRATION,
        name: modules.find((module) => module.code === AppDomain.Modules.ADMINISTRATION).name,
        permissions: [
          { code: AppDomain.Permissions.VIEW_SECTION_ADMINISTRATION, name: 'Acceder al módulo de administración' },
          { code: AppDomain.Permissions.LIST_USERS, name: 'Listar usuarios' },
        ],
      },
      {
        code: AppDomain.Modules.OPERATIONAL,
        name: modules.find((module) => module.code === AppDomain.Modules.OPERATIONAL).name,
        permissions: [
          {
            code: AppDomain.Permissions.ACCESS_MODULE_OPERATIONAL,
            name: 'Acceder al módulo operacional',
          },
          {
            code: AppDomain.Permissions.VIEW_SECTION_SALES,
            name: 'Ver sección de ventas',
          },
          {
            code: AppDomain.Permissions.VIEW_SECTION_REPORT_CENTRALIZATION,
            name: 'Ver sección de reportes de centralización',
          },
          {
            code: AppDomain.Permissions.VIEW_SECTION_HOME,
            name: 'Ver sección de inicio',
          },
          {
            code: AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS,
            name: 'Ver tabla de conversaciones',
          },
          {
            code: AppDomain.Permissions.VIEW_TABLE_BUDGETS,
            name: 'Ver tabla de presupuestos',
          },
          {
            code: AppDomain.Permissions.VIEW_TABLE_APPOINTMENTS,
            name: 'Ver tabla de agendamientos',
          },
          {
            code: AppDomain.Permissions.VIEW_TABLE_WORKORDERS,
            name: 'Ver tabla de órdenes de trabajo',
          },
          {
            code: AppDomain.Permissions.VIEW_TABLE_REASSIGNED_WORKORDERS,
            name: 'Ver tabla de órdenes de trabajo reasignadas',
          },
          {
            code: AppDomain.Permissions.UPDATE_APPOINTMENT_STATUS,
            name: 'Actualizar estado de agendamiento',
          },
          {
            code: AppDomain.Permissions.CREATE_BUDGETS,
            name: 'Crear presupuestos',
          },
          {
            code: AppDomain.Permissions.UPDATE_BUDGET_ITEM,
            name: 'Actualizar item de presupuesto',
          },
          {
            code: AppDomain.Permissions.DELETE_BUDGET_ITEM,
            name: 'Eliminar item de presupuesto',
          },
          {
            code: AppDomain.Permissions.CHANGE_BUDGET_ITEM,
            name: 'Remplazar item de presupuesto',
          },
          {
            code: AppDomain.Permissions.CREATE_NOTE,
            name: 'Crear notas',
          },
          {
            code: AppDomain.Permissions.CREATE_APPOINTMENT,
            name: 'Crear agendamientos',
          },
          {
            code: AppDomain.Permissions.UPDATE_APPOINTMENT,
            name: 'Actualizar agendamientos',
          },
          {
            code: AppDomain.Permissions.SENT_BUDGET,
            name: 'Enviar presupuesto',
          },
          {
            code: AppDomain.Permissions.DELETE_WORKORDER_ITEM,
            name: 'Eliminar item de orden de trabajo',
          },
          {
            code: AppDomain.Permissions.UPDATE_WORKORDER_ITEM,
            name: 'Actualizar item de orden de trabajo',
          },
          {
            code: AppDomain.Permissions.REASSIGN_WORK_ORDER,
            name: 'Reasignar orden de trabajo',
          },
          {
            code: AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS,
            name: 'Ver órdenes de trabajo asignadas',
          },
          {
            code: AppDomain.Permissions.SEARCH_GENERAL,
            name: 'Busqueda por patente nombre o marca',
          },
          {
            code: AppDomain.Permissions.EDIT_SUB_HEADER,
            name: 'Editar datos del sub-header',
          },
          {
            code: AppDomain.Permissions.UPDATE_CURRENT_STORE,
            name: 'Actualizar local actual',
          },
          {
            code: AppDomain.Permissions.DELETE_BUDGET,
            name: 'Eliminar presupuesto',
          },
          {
            code: AppDomain.Permissions.VIEW_MENU,
            name: 'Ver menú',
          },
          {
            code: AppDomain.Permissions.VIEW_SECURITY_REVIEW,
            name: 'Ver revisión de seguridad',
          },
          {
            code: AppDomain.Permissions.DELETE_FILE_NOTE,
            name: 'Eliminar archivo de nota',
          },
          {
            code: AppDomain.Permissions.ADD_FILE_TO_NOTE,
            name: 'Agregar archivo a nota',
          },
        ],
      },
      {
        code: AppDomain.Modules.REPORTS,
        name: modules.find((module) => module.code === AppDomain.Modules.OPERATIONAL).name,
        permissions: [{ code: AppDomain.Permissions.ACCESS_MODULE_REPORTS, name: 'Acceder al módulo de reportes' }],
      },
    ];

    const permissions: Permission[] = [];
    for (const moduleList of modulePermissionsList) {
      const module = modules.find((m) => m.code === moduleList.code);

      for (const permissionList of moduleList.permissions) {
        const existingPermission = await permissionRepository.findOne({
          where: { code: permissionList.code },
          relations: ['module'],
        });

        if (!existingPermission) {
          const permission = new Permission();
          permission.code = permissionList.code;
          permission.name = permissionList.name;
          permission.module = module;
          await permissionRepository.save(permission);
          permissions.push(permission);
        } else {
          permissions.push(existingPermission);
        }
      }
    }
    return permissions;
  }

  private async loadRoles(permissions: Permission[], roleRepository: Repository<Role>): Promise<Role[]> {
    const excludedPermissionsJS: AppDomain.Permissions[] = [
      AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS,
      AppDomain.Permissions.VIEW_SECURITY_REVIEW,
    ];
    const excludedPermissionsAdmin: AppDomain.Permissions[] = [
      AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS,
      AppDomain.Permissions.VIEW_SECURITY_REVIEW,
    ];
    const rolesData = [
      {
        name: AppDomain.Roles.ADMIN,
        permissions: permissions.filter(
          (permission) =>
            (permission.module.code === AppDomain.Modules.ADMINISTRATION ||
              permission.module.code === AppDomain.Modules.OPERATIONAL) &&
            !excludedPermissionsAdmin.includes(permission.code as AppDomain.Permissions),
        ),
      },
      {
        name: AppDomain.Roles.JEFE_DE_SERVICIO,
        permissions: permissions.filter(
          (permission) =>
            (permission.module.code === AppDomain.Modules.REPORTS ||
              permission.module.code === AppDomain.Modules.OPERATIONAL) &&
            !excludedPermissionsJS.includes(permission.code as AppDomain.Permissions),
        ),
      },
      {
        name: AppDomain.Roles.MAESTRO,
        permissions: permissions.filter(
          (permission) =>
            permission.code === AppDomain.Permissions.ACCESS_MODULE_OPERATIONAL ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_HOME ||
            permission.code === AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_REPORT_CENTRALIZATION ||
            permission.code === AppDomain.Permissions.CREATE_NOTE ||
            permission.code === AppDomain.Permissions.VIEW_SECURITY_REVIEW ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_SALES ||
            permission.code === AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS ||
            permission.code === AppDomain.Permissions.VIEW_TABLE_WORKORDERS ||
            permission.code === AppDomain.Permissions.DELETE_FILE_NOTE ||
            permission.code === AppDomain.Permissions.ADD_FILE_TO_NOTE,
        ),
      },
      {
        name: AppDomain.Roles.MAESTRO_ALINEADOR,
        permissions: permissions.filter(
          (permission) =>
            permission.code === AppDomain.Permissions.ACCESS_MODULE_OPERATIONAL ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_SALES ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_HOME ||
            permission.code === AppDomain.Permissions.CREATE_NOTE ||
            permission.code === AppDomain.Permissions.VIEW_SECURITY_REVIEW ||
            permission.code === AppDomain.Permissions.VIEW_SECTION_SALES ||
            permission.code === AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS ||
            permission.code === AppDomain.Permissions.DELETE_FILE_NOTE ||
            permission.code === AppDomain.Permissions.ADD_FILE_TO_NOTE,
        ),
      },
    ];
    const roles: Role[] = [];
    for (const roleData of rolesData) {
      let role = await roleRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      if (!role) {
        role = new Role();
        role.name = roleData.name;
        role.permissions = roleData.permissions;
      } else {
        const existingPermissionCodes = new Set(role.permissions.map((p) => p.code));
        const desiredPermissionCodes = roleData.permissions.map((p) => p.code);

        const hasDifference =
          role.permissions.length !== roleData.permissions.length ||
          desiredPermissionCodes.some((code) => !existingPermissionCodes.has(code));

        if (hasDifference) {
          role.permissions = roleData.permissions;
        }
      }

      roles.push(await roleRepository.save(role));
    }

    return roles;
  }

  private async loadStores(): Promise<Store[]> {
    const storesData = [
      { id: '6075fa65-9dd1-464a-8314-26d926a0a964', name: 'Estoril', address: 'Av. Las Condes 10133' },
      { id: 'a7ed64f6-8c89-4d52-8335-023162c4565b', name: 'Vitacura', address: 'Av. Vitacura 7520' },
      { id: '5c2fd7a0-bfe4-40dc-a31b-115cc07e1e04', name: 'Providencia', address: 'Av. Providencia 1234' },
    ];

    const stores = storesData.map((storeData) => {
      const store = new Store();
      store.id = storeData.id;
      store.name = storeData.name;
      store.address = storeData.address;
      return store;
    });

    return stores;
  }

  private async loadUsers(roles: Role[], stores: Store[], userRepository: Repository<User>): Promise<User[]> {
    const defaultUserValues = {
      passwordHash: await HashingUtils.secureHash('123123'),
      jobRole: 'Jefe de Servicio',
      phoneZone: 56,
      phoneNumber: 123456789,
      active: true,
      avatarPath: '/images/leonProfile.png',
    };
    const roleAdmin = roles.find((role) => role.name === AppDomain.Roles.ADMIN);
    const roleJS = roles.find((role) => role.name === AppDomain.Roles.JEFE_DE_SERVICIO);
    const roleMaestro = roles.find((role) => role.name === AppDomain.Roles.MAESTRO);
    const roleMaestroAlineador = roles.find((role) => role.name === AppDomain.Roles.MAESTRO_ALINEADOR);
    const storesEstoril = stores.filter((store) => store.name === 'Estoril');
    const allStores = stores;
    const usersData = [
      {
        rut: '11111111-1',
        name: 'Usuario',
        lastname: 'Borealis',
        email: 'usuario@borealis.cl',
        role: roleAdmin,
        stores: allStores,
      },
      {
        rut: '22222222-2',
        name: 'Baltasar',
        lastname: 'Magaña',
        email: 'baltasar.magana@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '33333333-3',
        name: 'Ricardo',
        lastname: 'Rojas',
        email: 'ricardo.rojas@borealis.cl',
        role: roleJS,
        stores: storesEstoril,
      },
      {
        rut: '44444444-4',
        name: 'Guillermo',
        lastname: 'Gutiérrez',
        email: 'guillermo.gutierrez@borealis.cl',
        role: roleAdmin,
        stores: storesEstoril,
      },
      {
        rut: '44444441-4',
        name: 'Guillermo',
        lastname: 'Mestro',
        email: 'guillermo.gutierrez+maestro@borealis.cl',
        role: roleAdmin,
        stores: storesEstoril,
      },
      {
        rut: '55555555-5',
        name: 'Daniel',
        lastname: 'Gutiérrez',
        email: 'daniel.gutierrez@borealis.cl',
        role: roleAdmin,
        stores: allStores,
      },
      {
        rut: '66666666-6',
        name: 'Fernanda',
        lastname: 'Alfaro',
        email: 'fernanda.alfaro@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '77777777-7',
        name: 'Daniel',
        lastname: 'Fernandez',
        email: 'daniel.fernandez@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '88888888-8',
        name: 'Bryan',
        lastname: 'Inostroza',
        email: 'bryan.inostroza@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '99999999-9',
        name: 'Tomas',
        lastname: 'León',
        email: 'tomas@leon.cl',
        role: roleJS,
        stores: allStores,
        active: false,
      },
      {
        rut: '10101010-1',
        name: 'Yordan',
        lastname: 'Nuñez',
        email: 'yordan@leon.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '16122955-5',
        name: 'Mario',
        lastname: 'Ubilla',
        email: 'mubilla@leon.cl',
        role: roleJS,
        stores: allStores,
        active: false,
      },
      {
        rut: '10101010-2',
        name: 'Julio',
        lastname: 'León',
        email: 'julio@leon.cl',
        role: roleJS,
        stores: allStores,
        active: false,
      },
      {
        rut: '10101010-3',
        name: 'Xavier',
        lastname: 'Schrader',
        email: 'xavier@leon.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '10101010-4',
        name: 'Daniel',
        lastname: 'Gallardo',
        email: 'daniel@leon.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '10101010-5',
        name: 'Diego',
        lastname: 'Urra',
        email: 'diego@leon.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '10101010-6',
        name: 'Claudio',
        lastname: 'Martínez',
        email: 'claudio@leon.cl',
        role: roleMaestroAlineador,
        stores: allStores,
      },
      {
        rut: '10101010-7',
        name: 'José',
        lastname: 'Bustos',
        email: 'jose@leon.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '10101010-8',
        name: 'Rodrigo',
        lastname: 'Sepulveda',
        email: 'rodrigo@leon.cl',
        role: roleMaestroAlineador,
        stores: allStores,
      },
      {
        rut: '20202020-4',
        name: 'Andrés',
        lastname: 'Ruiz',
        email: 'aruiz@leon.cl',
        role: roleJS,
        stores: allStores,
        active: false,
      },
      {
        rut: '30303030-5',
        name: 'Jeanluis',
        lastname: 'Alarcón',
        email: 'jalarcon@leon.cl',
        role: roleJS,
        stores: allStores,
        active: false,
      },
      {
        rut: '22222221-2',
        name: 'Baltasar',
        lastname: 'Maestro',
        email: 'baltasar.magana+maestro@borealis.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '33333331-3',
        name: 'Ricardo',
        lastname: 'Maestro',
        email: 'ricardo.rojas+maestro@borealis.cl',
        role: roleMaestro,
        stores: storesEstoril,
      },
      {
        rut: '99999991-9',
        name: 'Tomas',
        lastname: 'Maestro',
        email: 'tomas+maestro@leon.cl',
        role: roleMaestro,
        stores: allStores,
        active: false,
      },
      {
        rut: '10101011-1',
        name: 'Yordan',
        lastname: 'Maestro',
        email: 'yordan+maestro@leon.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '66666661-6',
        name: 'Fernanda',
        lastname: 'Maestro',
        email: 'fernanda.alfaro+maestro@borealis.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '77777771-7',
        name: 'Daniel',
        lastname: 'Maestro',
        email: 'daniel.fernandez+maestro@borealis.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '88888881-8',
        name: 'Bryan',
        lastname: 'Maestro',
        email: 'bryan.inostroza+maestro@borealis.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '11111112-1',
        name: 'Elba',
        lastname: 'Vargas',
        email: 'elba.vargas@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '11111113-1',
        name: 'Elba',
        lastname: 'Vargas',
        email: 'elba.vargas+maestro@borealis.cl',
        role: roleMaestro,
        stores: allStores,
      },
      {
        rut: '11111114-1',
        name: 'Luis',
        lastname: 'Jimenez',
        email: 'luis.jimenez@borealis.cl',
        role: roleJS,
        stores: allStores,
      },
      {
        rut: '11111114-2',
        name: 'Luis',
        lastname: 'Jimenez',
        email: 'luis.jimenez+maestro@borealis.cl',
        role: roleMaestro,
        stores: storesEstoril,
      },
    ];

    const isDevMode = process.env.MODE_APP === 'DEV';

    const users: User[] = [];

    for (const userData of usersData) {
      const exists = await userRepository.findOne({ where: { rut: userData.rut } });

      if (!exists) {
        const user = new User();
        user.rut = userData.rut;
        user.name = userData.name;
        user.lastname = userData.lastname;
        user.email = userData.email;
        user.role = userData.role;
        user.stores = userData.stores;
        user.passwordHash = defaultUserValues.passwordHash;
        user.jobRole = AppDomain.TECHNICIANS.includes(userData.role.name as AppDomain.Roles)
          ? userData.role.name
          : defaultUserValues.jobRole;
        user.phoneZone = defaultUserValues.phoneZone;
        user.phoneNumber = defaultUserValues.phoneNumber;
        user.active = isDevMode ? (userData.active ?? defaultUserValues.active) : defaultUserValues.active;

        users.push(user);
      }
    }
    return users;
  }
}
