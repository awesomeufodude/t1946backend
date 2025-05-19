import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { SharedModule } from 'src/shared/shared.module';
import { AuditLogService } from '../security/audit-log/audit-log.service';
import { SecurityModule } from '../security/security.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [SharedModule, DataModule, UsersModule, SecurityModule],
  controllers: [AdminController, UsersController],
  providers: [Logger, UsersService, AuditLogService],
  exports: [],
})
export class AdminModule {}
