import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookindLand } from './entities/bookindLand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [TypeOrmModule.forFeature([BookindLand])],
})
export class BookingsModule {}
