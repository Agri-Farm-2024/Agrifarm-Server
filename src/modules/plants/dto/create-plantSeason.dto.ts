import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { PlantSeasonType } from '../types/plant-season-type.enum';

export class CreatePlantSeasonDto {
  @ApiProperty({
    description: 'An interger field  with vale between 1 and 12',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month_start: number;

  @ApiProperty({
    description: 'total month the plant will be in season',
    example: 1,
  })
  @IsInt()
  @Min(1)
  total_month: number;

  @ApiProperty({
    description: 'Price the process',
    example: 10,
  })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  price_process: number;

  @ApiProperty({
    description: 'Price purchase per kg of the plant',
    example: 10,
  })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  price_purchase_per_kg: number;

  @ApiProperty({
    description: 'The type of plant season (in_season, off_season, etc.)',
    example: PlantSeasonType.in_season,
  })
  @IsEnum(PlantSeasonType)
  type: PlantSeasonType;

  @ApiProperty({
    description: 'The UUID of the plant this season is related to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  plant_id: string;
}
