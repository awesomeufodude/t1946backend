import { Inject, Injectable, Logger } from '@nestjs/common';
import HashingUtils from 'src/shared/utils/hashing.utils';
import { Between, DataSource } from 'typeorm';
import { PasscodeCredential } from '../entities/passcode-credential.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class PassCodeCredentialRepository extends AbstractRepository<PasscodeCredential> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(PasscodeCredential));
  }

  async find(options: any): Promise<PasscodeCredential[]> {
    return await this.repository.find(options);
  }

  async findOne(options: any): Promise<PasscodeCredential> {
    return await this.repository.findOne(options);
  }

  async save(data: PasscodeCredential): Promise<PasscodeCredential> {
    return await this.repository.save(data);
  }
  async findOnePasscodeCredential(
    hashCode: string,
    storeId: string,
    startOfDay: Date,
    endOfDay: Date,
    email?: string | null,
  ): Promise<PasscodeCredential> {
    const condition = {
      where: {
        passcodeHash: hashCode,
        store: { id: storeId },
        expiresAt: Between(startOfDay, endOfDay),
      },
      relations: ['user', 'user.stores', 'user.role', 'user.role.permissions', 'user.role.permissions.module'],
    };
    if (email && email !== null) {
      condition.where['user'] = { email };
    }
    return await this.repository.findOne(condition);
  }

  async findOnePasscodeCredentialByStoreAndUser(storeId: string, userId: string): Promise<PasscodeCredential> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        store: { id: storeId },
      },
      relations: ['user', 'user.stores', 'user.role'],
    });
  }

  async createPasscodeCredential(code: number, storeId: string, userId: string): Promise<PasscodeCredential> {
    const passcodeCredential = this.repository.create({
      passcodeHash: await HashingUtils.hash(code.toString()),
      store: { id: storeId },
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
      user: { id: userId },
    });

    return this.repository.save(passcodeCredential);
  }
}
