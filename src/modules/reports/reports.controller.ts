import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDTO } from './dto/create-report.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateReportProcessStandardDTO } from './dto/create-report-processStandard.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Post('/:task_id')
  create(
    @Body() data: CreateReportDTO,
    @Param('task_id') task_id: string,
    @Request() req: any,
  ) {
    const user = req['user'];
    return this.reportsService.createReport(data, task_id, user);
  }

  @Post('/createReportProcessStandard')
  createReportProcessStandard(@Body() data: CreateReportProcessStandardDTO) {
    return this.reportsService.createReportProcessStandard(data);
  }
}
