import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePlantDto } from './create-plant.dto';
import { StatusPlant } from '../types/plant-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePlantDto {
  // Override the status to use the enum type
  @ApiProperty({
    description: 'status of the plant',
    example: StatusPlant.active,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(StatusPlant)
  status: StatusPlant;
}
