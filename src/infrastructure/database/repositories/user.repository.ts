import { Inject, Injectable, Logger } from '@nestjs/common';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import { DataSource, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { AbstractRepository } from './abstract.repository';
import { RoleRepository } from './role.repository';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
    private readonly roleRepository: RoleRepository,
  ) {
    super(dataSource.getRepository(User));
  }

  async findByRut(rut: string): Promise<User> {
    this.logger.log(`findByRut: ${rut}`);
    return await this.repository.findOneBy({ rut });
  }

  async findById(id: string): Promise<User> {
    this.logger.log(`findById: ${id}`);

    return await this.repository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'role.permissions.module'],
    });
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`findByEmail: ${email}`);
    const user = await this.repository.findOne({
      where: { email },
      relations: ['stores'],
    });
    if (!user && email.endsWith('@borealis.cl')) {
      return await this.findByEmail(this.replaceEmail(email));
    }
    return user;
  }

  async findByEmailAndStoreAndMethodCode(email: string, storeId: string): Promise<User> {
    this.logger.log(`findByEmail: ${email} and store: ${storeId}`);
    const user = await this.repository.findOneBy({
      email,
      stores: { id: storeId },
      securityMethodTotem: SecurityDomain.SecurityMethodTotem.CODE,
    });
    if (!user && email.endsWith('@borealis.cl')) {
      return await this.findByEmailAndStoreAndMethodCode(this.replaceEmail(email), storeId);
    }
    return user;
  }

  async findRolesByNames(names: string[]): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { name: In(names) },
    });
  }

  async findUsersByRoleAndStore(storeId: string, roleIds: string[]): Promise<User[]> {
    this.logger.log(`findUsersByRoleAndStore: ${storeId} with roles ${roleIds}`);
    return await this.repository.find({
      where: {
        stores: { id: storeId },
        role: In(roleIds),
      },
    });
  }

  async save(user: User): Promise<User> {
    this.logger.log('save');
    return await this.repository.save(user);
  }

  private replaceEmail(email: string): string {
    return email.replace('@borealis.cl', '@leon.cl');
  }
}
