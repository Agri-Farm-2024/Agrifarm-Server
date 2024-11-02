import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService, LoggerService],
  imports: [TypeOrmModule.forFeature([Material])],

  exports: [MaterialsService],
})
export class MaterialsModule {}
