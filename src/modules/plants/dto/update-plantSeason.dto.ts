import { ApiOAuth2, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PlantSeasonType } from 'src/utils/types/plantSeason-type.enum';

export class UpdatePlantSeasonDto {
  @ApiProperty({
    description: 'the plant id to update',
    required: true,
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  plant_id: string;

  @ApiProperty({
    description: 'the month the plant will start',
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  month_start: number;

  @ApiProperty({
    description: 'the month the plant will start',
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  total_month: number;

  @ApiProperty({
    description: 'the price purchase per kg of the plant',
    required: true,
    example: 10,
  })
  @IsNotEmpty()
  price_purchase_per_kg: number;

  @ApiProperty({
    description: 'the price process',
    required: true,
    example: 10,
  })
  @IsNotEmpty()
  price_process: number;

  @ApiProperty({
    description: 'the type of plant season',
    required: true,
    example: 'in_season',
  })
    @IsNotEmpty()
    @IsEnum(PlantSeasonType)
    type: PlantSeasonType;

}
