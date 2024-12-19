import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { RequestsService } from '../requests/requests.service';
import { RequestStatus } from '../requests/types/request-status.enum';
import { UpdateStatusTaskDTO } from '../requests/dto/update-status-task.dto';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { JobService } from 'src/crons/job.service';
import { getNameOfPath } from 'src/utils/link.util';
import { UsersService } from '../users/users.service';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(
    private readonly mailService: MailService,
    private readonly notificationService: NotificationsService,

    private readonly requestService: RequestsService,
    private readonly serviceService: ServicesService,
    private readonly jobService: JobService,
    private readonly userService: UsersService,
  ) {}

  async test(): Promise<any> {
    try {
      // const users =
      //   await this.userService.getListExpertByProcessSpecificFreeTime();
      // return users;
      // await this.jobService.checkTransactionIsExpired();
      await this.jobService.checkEverydayIsExpired();
      // await this.jobService.checkTaskProcessContentForExpert();
      await this.jobService.checkAndCreatePurchaseProductService();
      // await this.mailService.sendMail(
      //   'phuoc.18112002@gmail.com',
      //   'test',
      //   'test.hbs',
      //   {
      //     name: 'test',
      //   },
      //   [
      //     {
      //       filename: 'images.png',
      //       path: 'uploadFile/images.png',
      //     },
      //   ],
      // );
      // await this.jobService.checkEverydayIsExpired();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async testNoti(id: string): Promise<any> {
    try {
      const test = await this.notificationService.createNotification({
        user_id: id,
        title: 'Test',
        content: 'Test',
        component_id: 'eddeed05-bace-4407-ab71-794cb5312ddf',
        type: NotificationType.booking_land,
      });

      return test;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
