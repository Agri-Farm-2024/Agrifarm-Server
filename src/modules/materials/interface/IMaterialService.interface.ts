import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { BuyMaterialDTO } from '../dto/buy-material.dto';
import { Payload } from 'src/modules/auths/types/payload.type';

export interface IMaterialService {
  createMaterial(createMaterialDto: any): any;

  updateMaterial(id: string, updateMaterialDto: any): any;

  getMaterials(pagination: PaginationParams): any;

  updateQuantityMaterial(material: string, quantity: number): Promise<any>;

  buyMaterial(materials: BuyMaterialDTO[], user: Payload): Promise<any>;

  handleCancelOrder(material: string, quantity: number): Promise<any>;
}
