import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportURL } from './entities/reportURL.entity';
import { TasksModule } from '../tasks/tasks.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    TypeOrmModule.forFeature([Report, ReportURL]),
    forwardRef(() => TasksModule),
    JwtModule,
    TasksModule,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
