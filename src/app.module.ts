import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { LandsModule } from './modules/lands/lands.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/postgres/database.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DinariesModule } from './modules/dinaries/dinaries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { AuthsModule } from './modules/auths/auths.module';
import { RedisModule } from './caches/redis/redis.module';
import { MailModule } from './mails/mail.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PlantsModule } from './modules/plants/plants.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ExtendsModule } from './modules/extends/extends.module';
import { ServicesModule } from './modules/servicesPackage/servicesPackage.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Config environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploadFile'), // Use __dirname to point to dist/uploadFile
      serveRoot: '/uploadFile',
    }),
    // Import modules
    LoggerModule,
    UsersModule,
    LandsModule,
    DatabaseModule,
    RequestsModule,
    TasksModule,
    ServicesModule,
    DinariesModule,
    NotificationsModule,
    ProcessesModule,
    AuthsModule,
    RedisModule,
    MailModule,
    ReportsModule,
    PlantsModule,
    ChannelsModule,
    BookingsModule,
    OrdersModule,
    MaterialsModule,
    TransactionsModule,
    ExtendsModule,
    UploadsModule,
  ],
})
export class AppModule {}
