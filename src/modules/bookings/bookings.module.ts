import { forwardRef, Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingLand } from './entities/bookingLand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LandsModule } from '../lands/lands.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [
    TypeOrmModule.forFeature([BookingLand]),
    JwtModule,
    LandsModule,
    forwardRef(() => TransactionsModule),
    LoggerModule,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
