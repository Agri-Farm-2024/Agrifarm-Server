import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(private readonly mailService: MailService) {}

  async test(): Promise<any> {
    try {
      const test = await this.mailService.sendMail(
        'chisbr2002@gmail.com',
        SubjectMailEnum.createBooking,
        TemplateMailEnum.createBooking,
        {
          full_name: 'Bao',
          time: '2021-10-10',
          location: 'HCM',
          staff_fullname: 'Huy',
          staff_phone: '0123456789',
          staff_email: 'test@gmail.com',
        },
      );
      return test;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
