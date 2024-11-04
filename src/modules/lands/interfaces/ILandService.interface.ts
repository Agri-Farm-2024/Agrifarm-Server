import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { LandStatus } from '../types/land-status.enum';
import { Payload } from 'src/modules/auths/types/payload.type';

export interface ILandService {
  createLand(data: any): any;

  getListByLandrenter(status: LandStatus, pagination: PaginationParams): any;

  getListLandByStaff(
    status: LandStatus,
    pagination: PaginationParams,
    user: Payload,
  ): any;

  getDetailLandById(id: string): any;

  updateLand(data: any, id: string): any;

  getLandType(): any;

  createLandType(data: any): any;

  updateLandType(data: any, id: string): any;

  deleteLandType(id: string): any;
}
