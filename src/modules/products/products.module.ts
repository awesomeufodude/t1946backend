import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TiresController } from './tires/tires.controller';
import { TiresModule } from './tires/tires.module';
import { TiresService } from './tires/tires.service';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';
@Module({
  imports: [TiresModule, DataModule],
  controllers: [TiresController, ProductsController],
  providers: [Logger, TiresService, ProductsService, WheelSizeService],
  exports: [],
})
export class ProductsModule {}
