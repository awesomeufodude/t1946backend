import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    rollbar.error(exception as Error, {
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
      },
      custom: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
      },
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
