import { Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { StatusPlant } from '../types/plant-status.enum';
export interface IPlantService {
  createPlant(createPlantDto: any): any;

  getAllPlants(pagination: PaginationParams): Promise<any>;

  updatePlant(id: string, status: StatusPlant): Promise<any>;

  removePlant(id: string): Promise<any>;

  createPlantSeason(createPlantSeasonDto: any): any;

  getAllPlantSeasons(pagination: PaginationParams): Promise<any>;

  updatePlantSeason(id: string, data: any): Promise<any>;

  getDetailPlantSeason(plant_season_id: string): Promise<any>;
}
