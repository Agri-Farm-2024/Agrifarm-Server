import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePlantDto } from './create-plant.dto';
import { StatusPlant } from '../types/plant-status.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Unique } from 'typeorm';
import { Transform } from 'class-transformer';

export class UpdatePlantDto {
  @ApiProperty({
    description: 'The UUID of the land type',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsOptional()
  land_type_id?: string;

  @ApiProperty({
    example: 'Plant Name',
    description: 'The name of the plant',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value.trim())
  name: string;
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
