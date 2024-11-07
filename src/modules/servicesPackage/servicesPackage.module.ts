import { Module } from '@nestjs/common';
import { ServicesService } from './servicesPackage.service';
import { ServiceSpecific } from './entities/serviceSpecific.entity';
import { ServicesController } from './servicesPackage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePackage } from './entities/servicePackage.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { PlantsModule } from '../plants/plants.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([ServiceSpecific, ServicePackage]),
    LoggerModule,
    PlantsModule,
    TransactionsModule,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
