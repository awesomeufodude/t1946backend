import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './shared/services/logger.service';
import { appConstants } from './config/app.constants';
import { ResponseTimeMiddleware } from './shared/middleware/responseTimeMiddleware';
import { CustomExceptionFilter } from './shared/filters/CustomExceptionFilter';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(), new CustomExceptionFilter());
  app.use(new ResponseTimeMiddleware().use);

  await app.listen(appConstants.SERVER_PORT);
}

bootstrap();
