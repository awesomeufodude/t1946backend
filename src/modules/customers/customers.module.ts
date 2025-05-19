import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
import { VehiclesService } from '../core/vehicles/vehicles.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CompanyBusinessController } from './company-business/company-business.controller';
import { CompanyBusinessService } from './company-business/company-business.service';
import { CompaniesController } from './companies/companies.controller';
import { CompaniesService } from './companies/companies.service';

@Module({
  imports: [DataModule],
  controllers: [CustomersController, CompanyBusinessController, CompaniesController],
  providers: [Logger, CustomersService, VehiclesService, WheelSizeService, CompanyBusinessService, CompaniesService],
})
export class CustomersModule {}
