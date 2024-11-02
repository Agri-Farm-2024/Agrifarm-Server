import { PaginationParams } from "src/common/decorations/types/pagination.type";

export interface IMaterialService {
  createMaterial(createMaterialDto: any): any;

  updateMaterial(id: string, updateMaterialDto: any): any;

  getMaterials( pagination: PaginationParams): any;
  
}
