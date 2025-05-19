import { Logger, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { VideoProcessor } from './video.processor';
import { DataModule } from 'src/infrastructure/database/data.module';
import { MinioModule } from 'src/infrastructure/minio/minio.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'videoQueue' }), DataModule, MinioModule],
  controllers: [UploadsController],
  providers: [UploadsService, VideoProcessor, Logger],
  exports: [UploadsService],
})
export class UploadModule {}
