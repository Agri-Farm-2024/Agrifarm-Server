import { Module } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plant } from './entities/plant.entity';
import { PlantSeason } from './entities/plantSeason';

@Module({
  imports: [TypeOrmModule.forFeature([Plant, PlantSeason])],
  controllers: [PlantsController],
  providers: [PlantsService],
})
export class PlantsModule {}
