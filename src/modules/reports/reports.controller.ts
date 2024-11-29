import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDTO } from './dto/create-report.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateReportProcessStandardDTO } from './dto/create-report-processStandard.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateReportPurchaseDto } from './dto/create-report-purchase.dto';

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

  @UseGuards(AuthGuard)
  @Post('/createReportPurchase/:task_id')
  createReportPurchase(
    @Body() data: CreateReportPurchaseDto,
    @Param('task_id') task_id: string,
    @Request() req: any,
  ) {
    const user = req['user'];
    return this.reportsService.createReportPurchase(data, task_id, user);
  }

  @Get('/:request_id')
  getListReportByRequestId(@Param('request_id') request_id: string) {
    return this.reportsService.getListReportByRequestId(request_id);
  }
}
