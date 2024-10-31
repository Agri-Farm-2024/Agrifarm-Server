import { Module } from '@nestjs/common';
import { DiscordsService } from './discords.service';
import { DiscordsController } from './discords.controller';

@Module({
  controllers: [DiscordsController],
  providers: [DiscordsService],
})
export class DiscordsModule {}
