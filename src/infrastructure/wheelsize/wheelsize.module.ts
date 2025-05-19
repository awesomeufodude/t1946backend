import { Module } from '@nestjs/common';
import { WheelSizeService } from './wheelsize.service';

@Module({
  providers: [WheelSizeService],
  exports: [WheelSizeService],
})
export class WheelSizeModule {}
