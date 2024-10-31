import { Logger, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'src/logger/logger.module';
import { Notification } from './entities/notification.entity';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [LoggerModule, TypeOrmModule.forFeature([Notification])],
  exports: [NotificationsService],
})
export class NotificationsModule {}
