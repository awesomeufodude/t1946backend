import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { appConstants } from './config/app.constants';
import { DataModule } from './infrastructure/database/data.module';
import { EmailModule } from './infrastructure/email/email.module';
import { AdminModule } from './modules/admin/admin.module';
import { BusinessModule } from './modules/business/business.module';
import { CoreModule } from './modules/core/core.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { SecurityModule } from './modules/security/security.module';
import { SharedModule } from './shared/shared.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CommonModule } from './modules/common/common.module';
import { SearchModule } from './modules/search/search.module';
import { BullModule } from '@nestjs/bull';
import { UploadsController } from './modules/uploads/uploads.controller';
import { MinioModule } from './infrastructure/minio/minio.module';
import { UploadModule } from './modules/uploads/upload.module';
import { MinioService } from './infrastructure/minio/minio.service';
import { FilesModule } from './modules/sales/notes/files/files.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: appConstants.REDIS_HOST,
        port: appConstants.REDIS_PORT,
        password: appConstants.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'videoQueue',
    }),
    SharedModule,
    CoreModule,
    SecurityModule,
    DataModule,
    SalesModule,
    AdminModule,
    EmailModule,
    ProductsModule,
    BusinessModule,
    CustomersModule,
    CommonModule,
    MinioModule,
    UploadModule,
    FilesModule,
    CacheModule.register({
      isGlobal: true,
      ttl: appConstants.TTL_CACHE,
      max: appConstants.MAX_CACHE,
    }),
    JwtModule.register({
      global: true,
      secret: appConstants.JWT_SECRET,
      signOptions: {
        expiresIn: appConstants.JWT_EXPIRATION_TIME,
      },
    }),
    SearchModule,
  ],
  controllers: [UploadsController],
  providers: [Logger, MinioService],
})
export class AppModule {
  constructor(private readonly logger: Logger) {
    this.logger.log('AppModule created');
  }
}
