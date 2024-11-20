import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportURL } from './entities/reportURL.entity';
import { TasksModule } from '../tasks/tasks.module';
import { JwtModule } from '@nestjs/jwt';
import { RequestsModule } from '../requests/requests.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    TypeOrmModule.forFeature([Report, ReportURL]),
    JwtModule,
    TasksModule,
    BookingsModule,
    forwardRef(() => TasksModule),
    forwardRef(() => RequestsModule),
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
