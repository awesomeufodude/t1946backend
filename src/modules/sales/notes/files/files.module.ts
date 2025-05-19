import { Logger, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DataModule } from 'src/infrastructure/database/data.module';
import { MinioModule } from 'src/infrastructure/minio/minio.module';

@Module({
  imports: [DataModule, MinioModule],
  controllers: [FilesController],
  providers: [FilesService, Logger],
  exports: [FilesService],
})
export class FilesModule {}
