import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOrderDetailDto {
  @IsUUID()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  material_id: string;

  @IsNumber()
  @IsNotEmpty()
  price_per_iteam: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
