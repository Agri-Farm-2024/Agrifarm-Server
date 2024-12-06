import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { BookingsModule } from 'src/modules/bookings/bookings.module';
import { ServicesModule } from 'src/modules/servicesPackage/servicesPackage.module';
import { ProcessesModule } from 'src/modules/processes/processes.module';
import { MaterialsModule } from 'src/modules/materials/materials.module';

@Module({
  imports: [
    TransactionsModule,
    BookingsModule,
    ServicesModule,
    ProcessesModule,
    MaterialsModule,
  ],
  providers: [JobService],
  exports: [JobService],
})
export class CronsModule {}
