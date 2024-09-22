import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';

@Module({
  controllers: [LandsController],
  providers: [LandsService],
})
export class LandsModule {}
