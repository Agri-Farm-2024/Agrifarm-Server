import { Logger, Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceSpecific } from './entities/serviceSpecific.entity';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [TypeOrmModule.forFeature([ServiceSpecific, Service]), LoggerModule],
})
export class ServicesModule {}
