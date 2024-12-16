import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ICronJob } from './interface/ICronJob.interface';
import { CronTime } from './types/cron-time.enum';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { LoggerService } from 'src/logger/logger.service';
import { ServicesService } from 'src/modules/servicesPackage/servicesPackage.service';
import { ProcessesService } from 'src/modules/processes/processes.service';
import { MaterialsService } from 'src/modules/materials/materials.service';

@Injectable()
export class JobService implements ICronJob {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly bookingLandService: BookingsService,

    private readonly servicePackageService: ServicesService,

    private readonly transactionService: TransactionsService,

    private readonly loggerService: LoggerService,

    private readonly processService: ProcessesService,

    private readonly materialService: MaterialsService,
  ) {}

  /**
   * Check and create report land everyday
   * Check and create report service everyday
   * Check and create report material everyday
   */

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
      // Checking booking material is expired
      await this.materialService.checkBookingMaterialIsExpired();
    } catch (error) {
      this.logger.error(`Error when check every day ${error.message}`);
      this.loggerService.error(`Error when check every day ${error.message}`, error.stack);
    }
  }

  /**
   *  Check transaction expire everyday
   */

  @Cron(CronTime.every_one_hour_a_day)
  async checkTransactionIsExpired(): Promise<void> {
    try {
      // Check transaction is expired
      await this.transactionService.checkTransactionIsExpired();
      this.logger.log('Check transaction expire is running');
      this.loggerService.log('Check transaction expire is running');
    } catch (error) {
      this.logger.error(`Error when check every one hour ${error.message}`);
      this.loggerService.error(`Error when check every one hour ${error.message}`, error.stack);
    }
  }

  /**
   * Check and create task process content for expert
   * Check and send notification for landrenter before new stage
   */

  @Cron(CronTime.every_five_pm_hours_a_day)
  async checkTaskProcessContentForExpert(): Promise<void> {
    try {
      // Check and create task process content for expert\
      await this.processService.checkAndCreateTaskProcessContentForExpert();
      this.logger.log('Check task process content for expert is running');
      this.loggerService.log('Check task process content for expert is running');
      // Check and send notification for landrenter before new stage
      await this.processService.CheckNewStageProcessSpecific();
      this.logger.log('Check and send noti process stage for land renter is running');
      this.loggerService.log('Check and send noti process stage for land renter is running');
    } catch (error) {
      this.logger.error(`Error when check every five pm  ${error.message}`);
      this.loggerService.error(`Error when check every five pm  ${error.message}`, error.stack);
    }
  }

  /**
   * Check and create purchase product service
   */

  @Cron(CronTime.every_eight_am_hours_a_day)
  async checkAndCreatePurchaseProductService(): Promise<void> {
    try {
      // Check and create task process content for land renter
      await this.servicePackageService.checkAndCreatePurchaseProductService();
      this.logger.log('Check and create purchase product service is running');
      this.loggerService.log('Check and create purchase product service is running');
    } catch (error) {
      this.logger.error(`Error when check every eight am  ${error.message}`);
      this.loggerService.error(`Error when check every eight am  ${error.message}`, error.stack);
    }
  }
}
