import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Min, IsOptional, Validate } from 'class-validator';
import { CreateProcessStageContentDto } from './create-process-standard-stage-content.dto';
import { CreateProcessStageMaterialDto } from './create-process-standard-stage-material.dto';
import { IsTimeEndGreaterThanStart } from 'src/common/decorations/isTimeEndGreaterThanStart.decoration';

export class CreateProcessStageDto {
  @ApiProperty({
    description: 'the title of the stage',
    example: 'Stage 1',
  })
  @IsString()
  @IsNotEmpty()
  stage_title: string;

  @ApiProperty({
    description: 'bumberic_order of the stage',
    example: 1,
  })
  @IsOptional()
  @Min(1)
  stage_numberic_order: number;

  @ApiProperty({
    description: 'time start of the stage',
    example: 1,
  })
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  time_start: number;

  @ApiProperty({
    description: 'time end of the stage',
    example: 1,
  })
  @IsNotEmpty()
  @IsOptional()
  @Validate(IsTimeEndGreaterThanStart, {
    message: 'time_end must be greater than time_start',
  })
  time_end: number;

  @ApiProperty({
    description: 'the material of the stage',
    type: [CreateProcessStageMaterialDto],
  })
  @IsOptional()
  @IsNotEmpty()
  material: CreateProcessStageMaterialDto[];

  @ApiProperty({
    description: 'the content of the stage',
    type: [CreateProcessStageContentDto],
  })
  @IsOptional()
  content: CreateProcessStageContentDto[];
}
