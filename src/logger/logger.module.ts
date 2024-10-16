import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService], // Make LoggerService available for other modules
})
export class LoggerModule {}
