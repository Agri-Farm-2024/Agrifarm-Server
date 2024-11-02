import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { LandStatus } from '../types/land-status.enum';

export interface ILandService {
  createLand(data: any): any;

  findAll(status: LandStatus, pagination: PaginationParams): any;

  getDetailLandById(id: string): any;

  updateLand(data: any, id: string): any;
  getLandType(): any;
  createLandType(data: any): any;
  updateLandType(data: any, id: string): any;
  deleteLandType(id: string): any;
}
