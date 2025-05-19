import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CreateLeadDto } from './customers.dto';
import { CustomersService } from './customers.service';

@Controller('customers/v1')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly logger: Logger,
  ) {}

  @Post('email/:email')
  async createLead(@Param('email') email: string, @Body() body: CreateLeadDto) {
    this.logger.log('createLead');
    const data = await this.customersService.createLead(email, body);
    return new SuccessResponseDto(data);
  }

  @Get('email/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    const data = await this.customersService.getCustomerByEmail(email);
    return new SuccessResponseDto(data);
  }

  @Get(':id')
  async getCustomerByIdAndType(@Param('id') id: string, @Query('type') type: string) {
    const data = await this.customersService.getCustomerByIdAndType(type, id);
    return new SuccessResponseDto(data);
  }

  @Get(':id/vehicles')
  async getCustomerVehicles(@Param('id') id: string) {
    const data = await this.customersService.getCustomerVehicles(id);
    return new SuccessResponseDto(data);
  }
}
