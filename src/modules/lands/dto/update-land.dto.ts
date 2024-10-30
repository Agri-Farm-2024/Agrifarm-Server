import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateLandDTO {
  @ApiProperty({
    description: 'The name of the land',
    example: 'Land 1',
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional() // Allows description to be null or undefined
  title: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional() // Allows description to be null or undefined
  description: string;

  @ApiProperty({
    description: 'the acreage of the land',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  acreage_land: number;

  @ApiProperty({
    description: 'The price of booking per month',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price_booking_per_month: number;

  @ApiProperty({
    description: 'Staff id',
    example: '1',
  })
  @IsString()
  @IsOptional()
  staff_id: string;
}
