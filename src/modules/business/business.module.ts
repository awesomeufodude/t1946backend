import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { SharedModule } from 'src/shared/shared.module';
import { LaborTimesController } from './labor-times/labor-times.controller';
import { LaborTimesService } from './labor-times/labor-times.service';
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';

@Module({
  imports: [SharedModule, DataModule],
  controllers: [LaborTimesController, StoresController],
  providers: [Logger, LaborTimesService, StoresService],
  exports: [],
})
export class BusinessModule {}
