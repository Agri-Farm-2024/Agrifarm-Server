import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { LoggerService } from 'src/logger/logger.service';
import { OrdersService } from '../orders/orders.service';
import { OrdersModule } from '../orders/orders.module';
import { LoggerModule } from 'src/logger/logger.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BookingMaterial } from './entities/booking-material.entity';
import { BookingMaterialDetail } from './entities/booking-material-detail.entity';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService],
  imports: [
    TypeOrmModule.forFeature([Material, BookingMaterial, BookingMaterialDetail]),
    LoggerModule,
    OrdersModule,
    TransactionsModule,
  ],
  exports: [MaterialsService],
})
export class MaterialsModule {}
