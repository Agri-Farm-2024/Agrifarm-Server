import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

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
          dirname: path.join('logs', this.getCurrentMonthFolder()), // Monthly folder
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          level: 'info',
        }),
      ],
    });
  }

  /**
   * Generate the current month folder name.
   * Format: YYYY-MM
   */
  private getCurrentMonthFolder(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
