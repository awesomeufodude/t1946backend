import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    res.on('finish', () => {
      const endTime = Date.now();
      const { method, originalUrl } = req;
      const { statusCode } = res;
      const responseTime = `${endTime - startTime}ms`;
      Logger.log(` ${method} ${originalUrl} ${statusCode} ${responseTime}`);
    });
    next();
  }
}
