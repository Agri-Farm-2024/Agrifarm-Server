import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    email: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: `./${template}`,
        context,
      });
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
