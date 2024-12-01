import { forwardRef, Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { OrdersModule } from '../orders/orders.module';
import { LoggerModule } from 'src/logger/logger.module';
import { BookingMaterial } from './entities/booking-material.entity';
import { BookingMaterialDetail } from './entities/booking-material-detail.entity';
import { JwtModule } from '@nestjs/jwt';
import { TransactionsModule } from '../transactions/transactions.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService],
  imports: [
    TypeOrmModule.forFeature([
      Material,
      BookingMaterial,
      BookingMaterialDetail,
    ]),
    LoggerModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => BookingsModule),
    JwtModule,
  ],
  exports: [MaterialsService],
})
export class MaterialsModule {}
