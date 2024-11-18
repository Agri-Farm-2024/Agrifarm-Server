import { forwardRef, Module } from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ExtendsController } from './extends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extend } from './entities/extend.entity';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  controllers: [ExtendsController],
  providers: [ExtendsService],
  imports: [
    TypeOrmModule.forFeature([Extend]),
    forwardRef(() => BookingsModule),
  ],
})
export class ExtendsModule {}
