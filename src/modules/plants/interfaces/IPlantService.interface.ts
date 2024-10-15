import { Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
export interface IPlantService {
  create(createPlantDto: any): any;

  getAllPlants(pagination: PaginationParams): Promise<any>;

  createPlantSeason(createPlantSeasonDto: any): any;
  getAllPlantSeasons(pagination: PaginationParams): Promise<any>;
}
