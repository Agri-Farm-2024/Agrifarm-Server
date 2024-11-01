import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateReportProcessStandardDTO } from './dto/create-report-processStandard.dto';
import { IReportService } from './interfaces/IReportService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from '../tasks/tasks.service';
import { TaskStatus } from '../tasks/types/task-status.enum';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService implements IReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportEntity: Repository<Report>,
    @Inject(forwardRef(() => TasksService))
    private readonly taskService: TasksService,
  ) {}

  async createReportProcessStandard(data: CreateReportProcessStandardDTO) {
    // Create a new instance of the Report entity
    const new_report = this.reportEntity.create(data as Partial<Report>);

    // Save the report to the database
    const saved_report = await this.reportEntity.save(new_report);
    if (!saved_report) {
      throw new BadRequestException('Unable to create report');
    }

    // Update Task status to completed
    await this.taskService.updateTaskStatus(data.task_id, TaskStatus.completed);

    // Return the newly created report
    return saved_report;
  }
}
