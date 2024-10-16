import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IRequestService } from './interfaces/IRequestService.interface';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mails/mail.service';
import { LoggerService } from 'src/logger/logger.service';
import { TasksService } from '../tasks/tasks.service';
import { RequestType } from './types/request-type.enum';

@Injectable()
export class RequestsService implements IRequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestEntity: Repository<Request>,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
    private readonly taskService: TasksService,
  ) {}

  async createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestEntity.save({
        ...data,
        type: RequestType.view_land,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTask(new_request.id);
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      this.loggerService.log(
        `New request view land created by ${data.guest_email}`,
      );
      // send mail
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
