import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookindLand } from './entities/bookindLand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LandsModule } from '../lands/lands.module';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [TypeOrmModule.forFeature([BookindLand]), JwtModule, LandsModule],
})
export class BookingsModule {}
