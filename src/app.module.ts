import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { LandsModule } from './modules/lands/lands.module';
import { LoggerModule } from './modules/logger/logger.module';
import { DatabaseModule } from './database/postgres/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ServicesModule } from './modules/services/services.module';
import { DinariesModule } from './modules/dinaries/dinaries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    // Config environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    }),
    // Import modules
    LoggerModule.register('App-Module'),
    UsersModule,
    LandsModule,
    DatabaseModule,
    RequestsModule,
    TasksModule,
    ServicesModule,
    DinariesModule,
    NotificationsModule,
    MessagesModule,
  ],
})
export class AppModule {}
