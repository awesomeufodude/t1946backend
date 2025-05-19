import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataModule } from 'src/infrastructure/database/data.module';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { SharedModule } from 'src/shared/shared.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuditLogController } from './audit-log/audit-log.controller';
import { AuditLogService } from './audit-log/audit-log.service';
import { PasscodeCredentialService } from './authentication/passcode-credential.service';
import { EmailModule } from 'src/infrastructure/email/email.module';

@Module({
  imports: [SharedModule, DataModule, AuditLogModule, EmailModule],
  controllers: [AuthenticationController, AuditLogController],
  providers: [
    AuthenticationService,
    AuditLogService,
    PasscodeCredentialService,
    Logger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class SecurityModule {}
