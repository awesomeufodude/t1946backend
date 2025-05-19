import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { DataModule } from 'src/infrastructure/database/data.module';
import { MinioModule } from 'src/infrastructure/minio/minio.module';

@Module({
  providers: [NotesService],
  controllers: [NotesController],
  imports: [DataModule, MinioModule],
})
export class NotesModule {}
