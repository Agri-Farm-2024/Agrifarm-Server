import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { BookingsModule } from 'src/modules/bookings/bookings.module';

@Module({
  imports: [TransactionsModule, BookingsModule],
  providers: [JobService],
})
export class CronsModule {}
