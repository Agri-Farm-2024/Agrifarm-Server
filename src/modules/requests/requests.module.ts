import { forwardRef, Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { TasksModule } from '../tasks/tasks.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
  imports: [
    TypeOrmModule.forFeature([Request]),
    LoggerModule,
    forwardRef(() => TasksModule),
    JwtModule,
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
