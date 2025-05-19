import { Logger, Module } from '@nestjs/common';
import { AppLogger } from './services/logger.service';
import { AuthGuard } from './guards/auth.guard';
import { DataModule } from 'src/infrastructure/database/data.module';

const moduleProviders = [AppLogger, AuthGuard];

@Module({
  imports: [DataModule],
  providers: [...moduleProviders, Logger],
  exports: [...moduleProviders],
})
export class SharedModule {}
