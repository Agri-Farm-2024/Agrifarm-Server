import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ICronJob } from './interface/ICronJob.interface';
import { CronTime } from './types/cron-time.enum';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class JobService implements ICronJob {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly bookingLandService: BookingsService,

    private readonly transactionService: TransactionsService,

    private readonly loggerService: LoggerService,
  ) {}

  @Cron(CronTime.check_booking_is_expired)
  async checkBookingIsExpired(): Promise<void> {
    await this.bookingLandService.checkBookingIsExpired();
    this.logger.log('Check booking expire is running');
    this.loggerService.log('Check booking expire is running');
  }

  @Cron(CronTime.check_transaction_is_expired)
  checkTransactionIsExpired(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
