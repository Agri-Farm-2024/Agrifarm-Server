import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { BuyMaterialDTO } from '../dto/buy-material.dto';
import { IUser } from 'src/modules/auths/types/IUser.interface';
import { MaterialType } from '../types/material-type.enum';

export interface IMaterialService {
  createMaterial(createMaterialDto: any): any;

  updateMaterial(id: string, updateMaterialDto: any): any;

  getMaterials(pagination: PaginationParams, type: MaterialType): any;

  updateQuantityMaterial(material: string, quantity: number): Promise<any>;

  buyMaterial(materials: BuyMaterialDTO[], user: IUser): Promise<any>;

  handleCancelOrder(material: string, quantity: number): Promise<any>;
}
