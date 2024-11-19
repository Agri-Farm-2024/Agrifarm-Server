import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { RequestsService } from '../requests/requests.service';
import { RequestStatus } from '../requests/types/request-status.enum';
import { UpdateStatusTaskDTO } from '../requests/dto/update-status-task.dto';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(
    private readonly mailService: MailService,
    private readonly notificationService: NotificationsService,
  ) {}

  async test(id): Promise<any> {
    try {
      console.log(id);
      // const test = await this.mailService.sendMail(
      //   'chisbr2002@gmail.com',
      //   SubjectMailEnum.createBooking,
      //   TemplateMailEnum.createBooking,
      //   {
      //     full_name: 'Bao',
      //     time: '2021-10-10',
      //     location: 'HCM',
      //     staff_fullname: 'Huy',
      //     staff_phone: '0123456789',
      //     staff_email: 'test@gmail.com',
      //   },
      // );
      // return test;
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
