import { forwardRef, Module } from '@nestjs/common';
import { ServicesService } from './servicesPackage.service';
import { ServiceSpecific } from './entities/serviceSpecific.entity';
import { ServicesController } from './servicesPackage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePackage } from './entities/servicePackage.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { PlantsModule } from '../plants/plants.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProcessesModule } from '../processes/processes.module';
import { BookingsModule } from '../bookings/bookings.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([ServiceSpecific, ServicePackage]),
    LoggerModule,
    PlantsModule,
    JwtModule,
    forwardRef(() => TransactionsModule),
    forwardRef(() => ProcessesModule),
    forwardRef(() => BookingsModule),
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
