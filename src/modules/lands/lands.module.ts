import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [LandsController],
  providers: [LandsService],
  imports: [TypeOrmModule.forFeature([Land]), LoggerModule],
})
export class LandsModule {}
