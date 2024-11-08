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

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([ServiceSpecific, ServicePackage]),
    LoggerModule,
    PlantsModule,
    forwardRef(() => TransactionsModule),
    forwardRef(() => ProcessesModule),
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
