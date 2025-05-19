import { Injectable, Logger } from '@nestjs/common';
import { CompanyBusinessRepository } from 'src/infrastructure/database/repositories/company-business.repository';
import { CompanyBusinessDto } from './company-business.dto';

@Injectable()
export class CompanyBusinessService {
  constructor(
    private readonly companyBusinessRepository: CompanyBusinessRepository,
    private readonly logger: Logger,
  ) {}

  async getCompanyBusinesses(): Promise<CompanyBusinessDto[]> {
    this.logger.log('getCompanyBusinesses');
    const companyBusinesses = await this.companyBusinessRepository.findAll();
    return companyBusinesses.map((business) => new CompanyBusinessDto(business));
  }
}
