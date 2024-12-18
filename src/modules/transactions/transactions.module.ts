import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { JwtModule } from '@nestjs/jwt';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { OrdersModule } from '../orders/orders.module';
import { ExtendsModule } from '../extends/extends.module';
import { MaterialsModule } from '../materials/materials.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => BookingsModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => ExtendsModule),
    JwtModule,
    MaterialsModule,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
