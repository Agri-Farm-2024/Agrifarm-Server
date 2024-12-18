import { forwardRef, Module } from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ExtendsController } from './extends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extend } from './entities/extend.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { JwtModule } from '@nestjs/jwt';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [ExtendsController],
  providers: [ExtendsService],
  imports: [
    TypeOrmModule.forFeature([Extend]),
    forwardRef(() => BookingsModule),
    forwardRef(() => TransactionsModule),
    JwtModule,
  ],
  exports: [ExtendsService],
})
export class ExtendsModule {}
