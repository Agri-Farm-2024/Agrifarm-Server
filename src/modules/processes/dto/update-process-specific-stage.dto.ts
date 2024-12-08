import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { UpdateProcessSpecificStageContentDto } from './update-process-specific-content.dto';
import { UpdateProcessSpecificStageMaterialDto } from './update-process-specific-material.dto';
import { IsTimeEndGreaterThanStart } from 'src/common/decorations/isTimeEndGreaterThanStart.decoration';

export class UpdateProcessSpecificStageDto {
  @ApiProperty({
    description: 'the UUID of the process specific stage',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  process_technical_specific_stage_id: string;

  @ApiProperty({
    description: 'the title of stage',
    example: 'Stage 1',
  })
  @IsNotEmpty()
  stage_title: string;

  @ApiProperty({
    description: 'bumberic_order of the stage',
    example: 1,
  })
  @IsOptional()
  stage_numberic_order: number;

  @ApiProperty({
    description: 'time start of the stage',
  })
  @IsNotEmpty()
  time_start: Date;

  @ApiProperty({
    description: 'time end of the stage',
  })
  @IsNotEmpty()
  @Validate(IsTimeEndGreaterThanStart, {
    message: 'time_end must be greater than time_start',
  })
  time_end: Date;
  @ApiProperty({
    description: 'the material of the stage',
    type: [UpdateProcessSpecificStageMaterialDto],
  })
  @IsOptional()
  material: UpdateProcessSpecificStageMaterialDto[];

  @ApiProperty({
    description: 'the content of the stage',
    type: [UpdateProcessSpecificStageContentDto],
  })
  @IsOptional()
  content: UpdateProcessSpecificStageContentDto[];

  @ApiProperty({
    description: 'the note of the stage',
  })
  @IsOptional()
  is_deleted: boolean;
}
