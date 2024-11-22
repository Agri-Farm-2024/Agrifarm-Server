import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BookingsModule } from '../bookings/bookings.module';
import { RequestsModule } from '../requests/requests.module';
import { MaterialsModule } from '../materials/materials.module';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { LandsModule } from '../lands/lands.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [
    JwtModule,
    UsersModule,
    TransactionsModule,
    BookingsModule,
    RequestsModule,
    MaterialsModule,
    ServicesModule,
    LandsModule,
    OrdersModule,
  ],
})
export class DashboardModule {}
