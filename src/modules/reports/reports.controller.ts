import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateReportProcessStandardDTO } from './dto/create-report-processStandard.dto';

@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() data: CreateReportProcessStandardDTO) {
    return this.reportsService.createReportProcessStandard(data);
  }

}
