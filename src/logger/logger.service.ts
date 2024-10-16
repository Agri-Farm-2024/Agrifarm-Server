import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService extends Logger {
  private readonly logger: winston.Logger;

  constructor() {
    super('AppLogger'); // Default context

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Custom timestamp format
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context || 'AppLogger'}] ${level}: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          level: 'info',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
