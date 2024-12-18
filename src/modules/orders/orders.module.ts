import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDetail } from './entities/orderDetail.entity';
import { MaterialsModule } from '../materials/materials.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail]),
    forwardRef(() => MaterialsModule),
    JwtModule,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
