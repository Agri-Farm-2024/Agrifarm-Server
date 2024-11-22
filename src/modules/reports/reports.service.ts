import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateReportProcessStandardDTO } from './dto/create-report-processStandard.dto';
import { IReportService } from './interfaces/IReportService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from '../tasks/tasks.service';
import { Report } from './entities/report.entity';
import { CreateReportDTO } from './dto/create-report.dto';
import { Payload } from '../auths/types/payload.type';
import { ReportURL } from './entities/reportURL.entity';
import { RequestsService } from '../requests/requests.service';
import { RequestStatus } from '../requests/types/request-status.enum';
import { RequestType } from '../requests/types/request-type.enum';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/types/user-role.enum';
import { User } from '../users/entities/user.entity';
import { CreateReportPurchaseDto } from './dto/create-report-purchase.dto';
import { Task } from '../tasks/entities/task.entity';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';

@Injectable()
export class ReportsService implements IReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(ReportURL)
    private readonly reportURLRepo: Repository<ReportURL>,

    private readonly taskService: TasksService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,

    private readonly bookingService: BookingsService,

    private readonly notificationService: NotificationsService,

    private readonly userService: UsersService,
  ) {}

  async createReport(data: CreateReportDTO, task_id: string, user: Payload) {
    try {
      // get detail task
      const task_exist: Task = await this.taskService.getDetailTask(task_id);
      //chekc report exist
      const report_exist = await this.reportRepository.findOne({
        where: { task_id: task_id },
        relations: {
          task: {
            request: true,
          },
        },
      });
      if (report_exist) {
        return report_exist;
      }
      // Check assigned user of this task
      if (task_exist.assigned_to_id !== user.user_id) {
        throw new ForbiddenException(
          'You are not assigned to this task, you cannot create a report',
        );
      }
      // create a new instance of the Report entity
      const new_report = await this.reportRepository.save({
        task_id: task_id,
        content: data.content,
      });
      // create url report
      if (data.url) {
        for (const url of data.url) {
          await this.reportURLRepo.save({
            report_id: new_report.report_id,
            url_link: url.url_link,
            url_type: url.url_type,
          });
        }
      }
      // check report type
      if (task_exist.request.type === RequestType.report_land) {
        // update quality for report
        await this.bookingService.updateBookingByReport(
          report_exist.task.request.booking_land_id,
          data.quality_report,
        );
      }
      //update request status to pending_approval
      await this.requestService.updateRequestStatus(
        report_exist.task.request_id,
        RequestStatus.pending_approval,
      );
      // send notification to assigned this task
      // get detail manager
      const manager: User[] = await this.userService.getListUserByRole(
        UserRole.manager,
      );
      await this.notificationService.createNotification({
        user_id: report_exist.task.assigned_by_id || manager[0].user_id,
        title: 'Báo cáo công việc',
        content: `Báo cáo đã được tạo cho công việc`,
        type: NotificationType.report,
        component_id: report_exist.task_id,
      });

      return new_report;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //create report purchase
  async createReportPurchase(
    data: CreateReportPurchaseDto,
    task_id: string,
    user: Payload,
  ) {
    try {
      const task_exist: Task = await this.taskService.getDetailTask(task_id);
      //chekc report exist
      const report_exist = await this.reportRepository.findOne({
        where: { task_id: task_id },
        relations: {
          task: {
            request: {
              service_specific: {
                plant_season: true,
                service_package: true,
              },
            },
          },
        },
      });
      if (report_exist) {
        return report_exist;
      }
      // Check assigned user of this task
      if (task_exist.assigned_to_id !== user.user_id) {
        throw new ForbiddenException(
          'You are not assigned to this task, you cannot create a report',
        );
      }

      if (
        task_exist.request.service_specific.service_package.purchase === true &&
        task_exist.request.service_specific.service_package.process_of_plant ===
          true
      ) {
        // create a new instance of the Report entity
        const new_report = await this.reportRepository.save({
          task_id: task_id,
          content: data.content,
          quality_plant_expect: data.quality_plant_expect,
          mass_plant_expect: data.mass_plant_expect,
          quality_plant: data.quality_plant,
          mass_plant: data.mass_plant,
          price_purchase_per_kg:
            report_exist.task.request.service_specific.price_purchase_per_kg,
        });
        //crete url report
        if (data.url) {
          for (const url of data.url) {
            await this.reportURLRepo.save({
              report_id: new_report.report_id,
              url_link: url.url_link,
              url_type: url.url_type,
            });
          }
        }
      }
      if (
        task_exist.request.service_specific.service_package.purchase ===
          false &&
        task_exist.request.service_specific.service_package.process_of_plant ===
          true
      ) {
        // create a new instance of the Report entity
        const new_report = await this.reportRepository.save({
          task_id: task_id,
          content: data.content,
          quality_plant_expect: data.quality_plant_expect,
          mass_plant_expect: data.mass_plant_expect,
          quality_plant: data.quality_plant,
          mass_plant: data.mass_plant,
          price_purchase_per_kg: data.price_purchase_per_kg,
        });
        //crete url report
        if (data.url) {
          for (const url of data.url) {
            await this.reportURLRepo.save({
              report_id: new_report.report_id,
              url_link: url.url_link,
              url_type: url.url_type,
            });
          }
        }
      }
      //update request status to pending_approval
      await this.requestService.updateRequestStatus(
        report_exist.task.request_id,
        RequestStatus.pending_approval,
      );
      // send notification to assigned this task
      // get detail manager
      const manager: User[] = await this.userService.getListUserByRole(
        UserRole.manager,
      );
      if (task_exist.request.type === RequestType.product_purchase) {
        await this.notificationService.createNotification({
          user_id: report_exist.task.assigned_by_id || manager[0].user_id,
          title: NotificationTitleEnum.report_purchase,
          content: `Báo cáo đã được tạo cho công việc`,
          type: NotificationType.report,
          component_id: report_exist.task_id,
        });
      }
      if (task_exist.request.type === RequestType.product_puchase_harvest) {
        await this.notificationService.createNotification({
          user_id: report_exist.task.assigned_by_id || manager[0].user_id,
          title: NotificationTitleEnum.report_harvest,
          content: `Báo cáo đã được tạo cho công việc`,
          type: NotificationType.report,
          component_id: report_exist.task_id,
        });
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createReportProcessStandard(data: CreateReportProcessStandardDTO) {
    // Create a new instance of the Report entity
    const new_report = this.reportRepository.create(data as Partial<Report>);

    // Save the report to the database
    const saved_report = await this.reportRepository.save(new_report);
    if (!saved_report) {
      throw new BadRequestException('Unable to create report');
    }

    // // Update Task status to completed
    // await this.taskService.updateTaskStatus(data.task_id, TaskStatus.completed);

    // Return the newly created report
    return saved_report;
  }

  //update
}
