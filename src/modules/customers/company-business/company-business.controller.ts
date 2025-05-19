import { Controller, Get, Logger } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CompanyBusinessService } from './company-business.service';

@Controller('customers/v1/company-business/all')
export class CompanyBusinessController {
  constructor(
    private readonly companyBusinessService: CompanyBusinessService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getCompanyBusinesses() {
    this.logger.log('getCompanyBusinesses');
    const data = await this.companyBusinessService.getCompanyBusinesses();
    return new SuccessResponseDto(data);
  }
}
