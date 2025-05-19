import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateOrUpdateCompanyDto } from './companies.dto';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

@Controller('companies/v1')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly logger: Logger,
  ) {}

  @Post()
  async createOrUpdateCompany(@Body() body: CreateOrUpdateCompanyDto) {
    this.logger.log('createOrUpdateCompany');
    const data = await this.companiesService.createOrUpdateCompany(body);
    return new SuccessResponseDto(data);
  }

  @Get(':rut')
  async getCompanyByRut(@Param('rut') rut: string) {
    this.logger.log('getCompanyByRut', rut);
    const data = await this.companiesService.getCompanyByRut(rut);
    return new SuccessResponseDto(data);
  }
}
