import { Module } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plant } from './entities/plant.entity';
import { PlantSeason } from './entities/plantSeason.entity';
import { LoggerService } from 'src/logger/logger.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Plant, PlantSeason]), JwtModule],
  controllers: [PlantsController],
  providers: [PlantsService, LoggerService],
  exports: [PlantsService],
})
export class PlantsModule {}
