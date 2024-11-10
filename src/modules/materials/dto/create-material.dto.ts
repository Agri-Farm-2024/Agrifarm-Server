import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { MaterialType } from '../types/material-type.enum';
import { MaterialUnit } from '../types/material-unit-enum';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'the name of material',
    example: 'cuốc',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the total quantity of material',
    example: '100',
  })
  @IsNotEmpty()
  total_quantity: number;

  @ApiProperty({
    description: 'the description of material',
    example: 'cuốc đất',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'the unit of material',
    example: MaterialUnit.piece,
  })
  
  @IsNotEmpty()
  unit: MaterialUnit;

  @ApiProperty({
    description: 'the price per piece',
    example: '100.000',
  })
  @IsOptional()
  price_per_piece: number;

  @ApiProperty({
    description: 'the deposit per piece',
    example: '100.000',
  })
  @IsOptional()
  deposit_per_piece: number;

  @ApiProperty({
    description: 'the image of material',
    example: 'https://www.google.com.vn',
  })
  @IsOptional()
  image_material: string;

  @ApiProperty({
    description: 'the price of rent',
    example: '100.000',
  })
  @IsOptional()
  price_of_rent: number;

  @ApiProperty({
    description: 'the type of material',
    example: MaterialType.buy,
  })
  @IsOptional()
  type: MaterialType;
}
