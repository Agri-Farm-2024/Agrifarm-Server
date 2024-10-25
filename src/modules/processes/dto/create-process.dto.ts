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
    description: 'total month of process',
    example: 12,
  })
  @IsNotEmpty()
  @IsOptional()
  @Max(12)
  @Min(1)
  total_month: number;

  @ApiProperty({
    description: 'the type of process',
    example: TypeProcess.in_season,
  })
  @IsNotEmpty()
  type_process: TypeProcess;

  @ApiProperty({
    description: 'the stage of process',
    type: [CreateProcessStageDto],
  })
  @IsOptional()
  stage: CreateProcessStageDto[];
}
