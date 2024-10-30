import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { LandSubDescription } from './entities/landSubDescription.entity';
import { LandURL } from './entities/landURL.entity';
import { LandType } from './entities/landType.entity';

@Module({
  controllers: [LandsController],
  providers: [LandsService],
  imports: [
    TypeOrmModule.forFeature([Land, LandSubDescription, LandURL, LandType]),
    LoggerModule,
  ],
  exports: [LandsService],
})
export class LandsModule {}
