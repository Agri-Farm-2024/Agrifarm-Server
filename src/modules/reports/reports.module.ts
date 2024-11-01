import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportURL } from './entities/reportURL.entity';
import { TasksService } from '../tasks/tasks.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    TypeOrmModule.forFeature([Report, ReportURL]),
    forwardRef(() => TasksModule),
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
