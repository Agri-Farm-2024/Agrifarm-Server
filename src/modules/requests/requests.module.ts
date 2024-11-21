import { forwardRef, Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { TasksModule } from '../tasks/tasks.module';
import { JwtModule } from '@nestjs/jwt';
import { ProcessesModule } from '../processes/processes.module';
import { MaterialsModule } from '../materials/materials.module';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
  imports: [
    TypeOrmModule.forFeature([Request]),
    LoggerModule,
    JwtModule,
    MaterialsModule,
    forwardRef(() => TasksModule),
    forwardRef(() => ProcessesModule),
    ServicesModule,
    forwardRef(() => BookingsModule),
    ChannelsModule,
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
