import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { LandsModule } from './modules/lands/lands.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/postgres/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ServicesModule } from './modules/services/services.module';
import { DinariesModule } from './modules/dinaries/dinaries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { AuthsModule } from './modules/auths/auths.module';
import { RedisModule } from './caches/redis/redis.module';
import { MailModule } from './mails/mail.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PlantsModule } from './modules/plants/plants.module';

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
    ProcessesModule,
    AuthsModule,
    RedisModule,
    MailModule,
    ReportsModule,
    PlantsModule,
  ],
})
export class AppModule {}
