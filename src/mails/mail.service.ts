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
    attachments?: Array<{ filename: string; path: string }>,
  ): Promise<void> {
    try {
      if (attachments.length > 0) {
        attachments = attachments.map((attachment) => {
          return {
            filename: attachment.filename,
            path: `./dist/${attachment.path}`,
          };
        });
      }

      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: `./${template}`,
        context,
        attachments,
      });
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
