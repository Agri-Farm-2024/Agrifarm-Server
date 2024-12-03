import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { BuyMaterialDTO } from '../dto/buy-material.dto';
import { IUser } from 'src/modules/auths/types/IUser.interface';
import { MaterialType } from '../types/material-type.enum';
import { RentMaterialDto } from '../dto/rent-material.dto';

export interface IMaterialService {
  createMaterial(createMaterialDto: any): any;

  updateMaterial(id: string, updateMaterialDto: any): any;

  getMaterials(pagination: PaginationParams, type: MaterialType): any;

  updateQuantityMaterial(material: string, quantity: number): Promise<any>;

  buyMaterial(materials: BuyMaterialDTO[], user: IUser): Promise<any>;

  handleCancelOrder(material: string, quantity: number): Promise<any>;

  bookingMaterial(data: RentMaterialDto, user: IUser): Promise<any>;

  updateBookingMaterialStatus(
    booking_material_id: string,
    status: string,
  ): Promise<any>;
}
