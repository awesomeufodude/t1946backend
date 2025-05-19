import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
import { VehiclesService } from '../core/vehicles/vehicles.service';
import { CustomersService } from '../customers/customers.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, Logger, CustomersService, VehiclesService, WheelSizeService],
  imports: [DataModule],
})
export class SearchModule {}
