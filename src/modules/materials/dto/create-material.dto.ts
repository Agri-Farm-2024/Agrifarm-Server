import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsOptional } from 'class-validator';
import { Material } from '../entities/material.entity';
import { MaterialType } from '../types/material-type.enum';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'the name of material',
    example: 'cuốc',
  })
  @IsEmpty()
  name: string;

  @ApiProperty({
    description: 'the total quantity of material',
    example: '100',
  })
  @IsEmpty()
  total_quantity: number;

  @ApiProperty({
    description: 'the price per piece',
    example: '100.000',
  })
  @IsEmpty()
  price_per_piece: number;

  @ApiProperty({
    description: 'the deposit per piece',
    example: '100.000',
  })
  @IsEmpty()
  deposit_per_piece: number;

  @ApiProperty({
    description : 'the image of material',
    example: 'https://www.google.com.vn',

  })
    @IsOptional()
    image_material: string;

    @ApiProperty({
        description: 'the price of rent',
        example: '100.000',
    })
    @IsEmpty()
    price_of_rent: number;

    @ApiProperty({
        description: 'the type of material',
        example: MaterialType.buy,
    })
    @IsEmpty()
    type: MaterialType;


}
