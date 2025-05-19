import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { SharedModule } from 'src/shared/shared.module';
import { VehiclesController } from './vehicles/vehicles.controller';
import { VehiclesService } from './vehicles/vehicles.service';
import { WheelSizeModule } from 'src/infrastructure/wheelsize/wheelsize.module';
import { ServicesController } from './services/services.controller';
import { ServicesService } from './services/services.service';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';

@Module({
  imports: [SharedModule, DataModule, WheelSizeModule],
  controllers: [VehiclesController, ServicesController],
  providers: [Logger, VehiclesService, ServicesService, ServiceItemsStatusesRepository],
  exports: [ServiceItemsStatusesRepository],
})
export class CoreModule {}
