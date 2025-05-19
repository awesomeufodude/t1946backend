import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    this.safeLog('log', message, context);
  }

  warn(message: string, context?: string) {
    this.safeLog('warn', message, context);
  }

  debug(message: string, context?: string) {
    this.safeLog('debug', message, context);
  }

  verbose(message: string, context?: string) {
    this.safeLog('verbose', message, context);
  }

  error(message: string, stack?: string, context?: string) {
    const method = 'error';
    const callerFile = this.getCallerFile();
    const formattedMessage = callerFile ? `[${callerFile}] ${message}` : message;
    if (context) {
      super[method](`${formattedMessage}`, stack, context);
    } else {
      super[method](`${formattedMessage}`);
    }
  }

  private safeLog(method, message, context) {
    const callerFile = this.getCallerFile();
    const formattedMessage = callerFile ? `[${callerFile}] ${message}` : message;
    if (context) {
      super[method](`${formattedMessage}`, context);
    } else {
      super[method](`${formattedMessage}`);
    }
  }

  private getCallerFile(): string {
    const stack = new Error().stack;
    if (stack) {
      const stackLines = stack.split('\n');
      const callerLine = stackLines[6]; // omite llamadas internas del logger hasta la linea del caller
      const filePathParts = callerLine.indexOf('\\') > -1 ? callerLine.split('\\') : callerLine.split('/');
      let callerFile = filePathParts[filePathParts.length - 1];
      callerFile = callerFile.substring(0, callerFile.length - 2);
      return callerFile;
    }
    return null;
  }
}
