import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService],
  imports: [TypeOrmModule.forFeature([Material])],
})
export class MaterialsModule {}
