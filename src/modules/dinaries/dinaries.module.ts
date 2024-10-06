import { Module } from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { DinariesController } from './dinaries.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dinary } from './entities/dinary.entity';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryImage } from './entities/DinaryImange.entity';

@Module({
  controllers: [DinariesController],
  providers: [DinariesService],
  imports: [
    LoggerModule.register('Dinary-Module'),
    TypeOrmModule.forFeature([Dinary, DinaryStage,  DinaryImage]),
  ],
  exports: [DinariesService],
})
export class DinariesModule {}
