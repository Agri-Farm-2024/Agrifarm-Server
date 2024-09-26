import { Module } from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { DinariesController } from './dinaries.controller';

@Module({
  controllers: [DinariesController],
  providers: [DinariesService],
})
export class DinariesModule {}
