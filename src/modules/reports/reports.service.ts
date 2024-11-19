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
import { Task } from '../tasks/entities/task.entity';
import { ReportURL } from './entities/reportURL.entity';
import { RequestsService } from '../requests/requests.service';
import { RequestStatus } from '../requests/types/request-status.enum';

@Injectable()
export class ReportsService implements IReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(ReportURL)
    private readonly reportURLRepo: Repository<ReportURL>,

    private readonly taskService: TasksService,

    private readonly requestService: RequestsService,
  ) {}

  async createReport(data: CreateReportDTO, task_id: string, user: Payload) {
    try {
      //chekc report exist
      const report_exist = await this.reportRepository.findOne({
        where: { task_id: task_id },
      });
      if (report_exist) {
        throw new BadRequestException('Report already exist');
      }

      // get detail task
      const task_exist: Task = await this.taskService.getDetailTask(task_id);
      if (task_exist.assigned_to_id !== user.user_id) {
        throw new ForbiddenException('You are not assigned to this task');
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
        //update request status
        //take request is status in progress
        const request = await this.taskService.getDetailTask(task_id);
        if (request.request_i.status === 'in_progress') {
          await this.requestService.updateRequestStatus(
            request.request_id,
            RequestStatus.completed,
          );
        }
      }
      return new_report;
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
}
