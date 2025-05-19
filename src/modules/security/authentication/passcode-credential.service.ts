import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PassCodeCredentialRepository } from 'src/infrastructure/database/repositories/passcode-credential.repository';
import HashingUtils from 'src/shared/utils/hashing.utils';
import { PasscodeCredential } from '../../../infrastructure/database/entities/passcode-credential.entity';

@Injectable()
export class PasscodeCredentialService {
  private readonly CODE_LENGTH = 5;
  constructor(
    private readonly logger: Logger,
    private readonly passcodeCredentialRepository: PassCodeCredentialRepository,
  ) {}

  async isCodeUnique(code: number, storeId: string): Promise<boolean> {
    this.logger.log(`isCodeUnique`);
    const [startOfDay, endOfDay] = this.getStarAndEndOfDay();
    const hashCode = await HashingUtils.hash(code.toString());
    const existCode = await this.passcodeCredentialRepository.findOnePasscodeCredential(
      hashCode,
      storeId,
      startOfDay,
      endOfDay,
    );
    if (existCode) {
      return false;
    }
    return true;
  }

  async generateUniqueCode(storeId: string, userId: string): Promise<number> {
    this.logger.log(`generateUniqueCode`);
    const isUnique: boolean = false;
    const code = await this.getUniqueCode(isUnique, storeId);
    const passcodeCredential = await this.passcodeCredentialRepository.findOnePasscodeCredentialByStoreAndUser(
      storeId,
      userId,
    );
    if (passcodeCredential) {
      await this.update(code, passcodeCredential);
    } else {
      await this.create(code, storeId, userId);
    }

    return code;
  }

  private async getUniqueCode(isUnique: boolean, storeId: string): Promise<number> {
    this.logger.log(`getUniqueCode`);
    let code = 0;

    for (let i = 0; i < 10; i++) {
      code = this.generateRandomCode();
      const isCodeUnique = await this.isCodeUnique(code, storeId);

      if (isCodeUnique) {
        return code;
      }
    }

    throw new InternalServerErrorException('Error al generar el código de acceso');
  }
  private generateRandomCode(): number {
    const length = this.CODE_LENGTH;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  getStarAndEndOfDay(): [Date, Date] {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    return [startOfDay, endOfDay];
  }

  private async create(code: number, storeId: string, userId: string): Promise<void> {
    this.passcodeCredentialRepository.createPasscodeCredential(code, storeId, userId);
  }

  private async update(code: number, passcodeCredential: PasscodeCredential): Promise<void> {
    passcodeCredential.passcodeHash = await HashingUtils.hash(code.toString());
    passcodeCredential.expiresAt = new Date(new Date().setHours(23, 59, 59, 999));
    await this.passcodeCredentialRepository.save(passcodeCredential);
  }

  async verifyCode(code: number, storeId: string, email: string | null): Promise<PasscodeCredential> {
    this.logger.log(`verifyCode`);
    const hashCode = await HashingUtils.hash(code.toString());
    const [startOfDay, endOfDay] = this.getStarAndEndOfDay();

    const existCode = await this.passcodeCredentialRepository.findOnePasscodeCredential(
      hashCode,
      storeId,
      startOfDay,
      endOfDay,
      email,
    );
    if (existCode) {
      return existCode;
    }
    return null;
  }
}
