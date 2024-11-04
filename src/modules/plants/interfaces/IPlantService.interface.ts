import { Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { StatusPlant } from '../types/plant-status.enum';
import { UpdatePlantDto } from '../dto/update-plant.dto';
import { Plant } from '../entities/plant.entity';
export interface IPlantService {
  createPlant(createPlantDto: any): any;

  getAllPlants(pagination: PaginationParams): Promise<any>;

  updatePlant(id: string,updateData: UpdatePlantDto): Promise<Plant>

  removePlant(id: string): Promise<any>;
  removePlantSeason(id: string): Promise<any>;

  createPlantSeason(createPlantSeasonDto: any): any;

  getAllPlantSeasons(pagination: PaginationParams): Promise<any>;

  updatePlantSeason(id: string, data: any): Promise<any>;

  getDetailPlantSeason(plant_season_id: string): Promise<any>;

}
