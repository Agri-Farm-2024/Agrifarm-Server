import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class BuyMaterialDTO {
  @ApiProperty({
    example: '1',
    description: 'The material id',
  })
  @IsNotEmpty({
    message: 'Material id is required',
  })
  material_id: string;

  @ApiProperty({
    example: 1,
    description: 'The quantity of material',
  })
  @IsNotEmpty({
    message: 'Quantity is required',
  })
  @IsPositive({
    message: 'Quantity must be positive number',
  })
  quantity: number;
}
