import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateProcessStageDto } from './create-process-stage.dto';
import { UpdateProcessStandardStageDto } from './update-process-standard-stage.dto';

export class UpdateProcessStandardsDto {
  @ApiProperty({
    description: 'the UUID of the process standard',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  process_technical_standard_id: string;

  @ApiProperty({
    description: 'the name process',
    example: 'Process 1',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the stage of process',
    type: [UpdateProcessStandardStageDto],
  })
  @IsOptional()
  stage: UpdateProcessStandardStageDto[];
}
