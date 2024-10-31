import { LandStatus } from '../types/land-status.enum';

export interface ILandService {
  createLand(data: any): any;

  findAll(status: LandStatus): any;

  getDetailLandById(id: string): any;

  updateLand(data: any, id: string): any;
  getLandType(): any;
  createLandType(data: any): any;
}
