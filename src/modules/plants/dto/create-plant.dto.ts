import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusPlant } from '../types/plant-status.enum';

export class CreatePlantDto {
  @ApiProperty({
    description: 'The UUID of the land type',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsNotEmpty({ message: 'Land type is required' })
  land_type_id: string;
  @ApiProperty({
    example: 'Plant Name',
    description: 'The name of the plant',
  })
  @IsNotEmpty({ message: 'Plant name is required' })
  name: string;
}
