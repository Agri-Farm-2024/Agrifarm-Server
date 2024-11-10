import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { JwtModule } from '@nestjs/jwt';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    forwardRef(() => BookingsModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => OrdersModule),
    JwtModule,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
