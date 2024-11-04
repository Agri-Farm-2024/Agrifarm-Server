import { forwardRef, Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingLand } from './entities/bookingLand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LandsModule } from '../lands/lands.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [
    TypeOrmModule.forFeature([BookingLand]),
    JwtModule,
    LandsModule,
    forwardRef(() => TransactionsModule),
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
