import { forwardRef, Module } from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { DinariesController } from './dinaries.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryImage } from './entities/DinaryImange.entity';
import { LoggerService } from 'src/logger/logger.service';
import { JwtModule } from '@nestjs/jwt';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  controllers: [DinariesController],
  providers: [DinariesService, LoggerService],
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([DinaryStage, DinaryImage]),
    JwtModule,
    forwardRef(() => ProcessesModule),
  ],
  exports: [DinariesService],
})
export class DinariesModule {}
