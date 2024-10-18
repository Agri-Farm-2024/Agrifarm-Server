export interface ILandService {
  createLand(data: any): any;

  findAll(): any;

  getDetailLandById(id: string): any;

  updateLand(data: any, id: string): any;
}
