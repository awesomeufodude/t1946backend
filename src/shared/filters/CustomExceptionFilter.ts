import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    let data: any = exception.message;
    if (exception instanceof BadRequestException) {
      data = exception.getResponse();
    }
    response.status(status).json({
      data,
      message: status,
    });
  }
}
