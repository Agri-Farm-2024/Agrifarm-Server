import { Injectable } from '@nestjs/common';
import { ICronJob } from './interface/ICronJob.interface';
import { Cron } from '@nestjs/schedule';
import { CronTime } from './types/cron-time.enum';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import { TransactionsService } from 'src/modules/transactions/transactions.service';

@Injectable()
export class JobService implements ICronJob {
  constructor(
    private readonly bookingLandService: BookingsService,
    private readonly transactionService: TransactionsService,
  ) {}

  @Cron(CronTime.check_booking_is_expired)
  checkBookingIsExpired(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @Cron(CronTime.check_transaction_is_expired)
  checkTransactionIsExpired(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
