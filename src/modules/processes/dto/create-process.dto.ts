import { IsNotEmpty, Max, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TypeProcess } from '../types/type-process.enum';
import { CreateProcessStageDto } from './create-process-stage.dto';
export class CreateProcessDto {
  @ApiProperty({
    description: 'the UUID of the plant',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  plant_season_id: string;

  @ApiProperty({
    description: 'the name process',
    example: 'Process 1',
  })
  @IsNotEmpty()
  name: string;

  

    @ApiProperty({
    description: 'the stage of process',
    type: [CreateProcessStageDto],
  })
  @IsOptional()
  stage: CreateProcessStageDto[];
}
