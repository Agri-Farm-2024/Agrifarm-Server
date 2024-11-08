import { IsArray, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOrderDetailDto {
  @IsUUID()
  order_id: string;

  @IsString()
  material_id: string;

  @IsNumber()
  price_per_iteam: number;

  @IsNumber()
  quantity: number;
}
