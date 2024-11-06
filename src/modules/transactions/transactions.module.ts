import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => BookingsModule),
    JwtModule,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
