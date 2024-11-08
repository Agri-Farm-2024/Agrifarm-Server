import { IsArray, IsNumber, IsUUID } from 'class-validator';

export class CreateOrderDetailDto {
  @IsUUID()
  order_id: string;

  @IsArray()
  materials: {
    material_id: string;
    quantity: number;
    price: number;
  }[];

  @IsNumber()
  total_price: number;
}
