import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusPlant } from '../types/plant-status.enum';

export class CreatePlantDto {
  @ApiProperty({
    example: 'Plant Name',
    description: 'The name of the plant',
  })
  @IsNotEmpty({ message: 'Plant name is required' })
  name: string;

  @ApiProperty({
    description: 'status of the plant',
    example: StatusPlant.active,
  })
  @IsNotEmpty({ message: 'Plant status is required' })
  @IsEnum(StatusPlant)
  status: StatusPlant;
}
