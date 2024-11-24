import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ICronJob } from './interface/ICronJob.interface';
import { CronTime } from './types/cron-time.enum';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { LoggerService } from 'src/logger/logger.service';
import { ServicesService } from 'src/modules/servicesPackage/servicesPackage.service';
import { ProcessesService } from 'src/modules/processes/processes.service';

@Injectable()
export class JobService implements ICronJob {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly bookingLandService: BookingsService,

    private readonly servicePackageService: ServicesService,

    private readonly transactionService: TransactionsService,

    private readonly loggerService: LoggerService,

    private readonly processService: ProcessesService,
  ) {}

  @Cron(CronTime.every_new_day)
  async checkEverydayIsExpired(): Promise<void> {
    try {
      // Checking booking is expired and create report land
      await this.bookingLandService.checkBookingIsExpired();
      this.logger.log('Check booking expire is running');
      this.loggerService.log('Check booking expire is running');
      // Checking service is expired
      await this.servicePackageService.checkServiceIsExpired();
      this.logger.log('Check service expire is running');
      this.loggerService.log('Check service expire is running');
    } catch (error) {
      this.logger.error(`Error when check every day ${error.message}`);
      this.loggerService.error(
        `Error when check every day ${error.message}`,
        error.stack,
      );
    }
  }

  @Cron(CronTime.every_ten_minutes)
  checkTransactionIsExpired(): Promise<void> {
    this.logger.log('Check transaction expire is running');
    this.loggerService.log('Check transaction expire is running');
    throw new Error('Method not implemented.');
  }

  @Cron(CronTime.every_five_pm_hours_a_day)
  async checkTaskProcessContentForExpert(): Promise<void> {
    try {
      // Check and create task process content for expert\
      await this.processService.checkAndCreateTaskProcessContentForExpert();
      this.logger.log('Check task process content for expert is running');
      this.loggerService.log(
        'Check task process content for expert is running',
      );
    } catch (error) {
      this.logger.error(
        `Error when check task process content for expert ${error.message}`,
      );
      this.loggerService.error(
        `Error when check task process content for expert ${error.message}`,
        error.stack,
      );
    }
  }
}
