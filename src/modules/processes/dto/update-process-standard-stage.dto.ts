import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Max,
  Min,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { time } from 'console';
import { CreateProcessStageContentDto } from './create-process-stage-content.dto';
import { CreateProcessStageMaterialDto } from './create-process-stage-material.dto';
import { UpdateProcessStandardStageContentDto } from './update-process-standard-content.dto';
import { UpdateProcessStandardStageMaterialDto } from './update-process-standard-material.dto';

@ValidatorConstraint({ name: 'isTimeEndGreaterThanStart', async: false })
export class IsTimeEndGreaterThanStart implements ValidatorConstraintInterface {
  validate(time_end: number, args: ValidationArguments) {
    const object = args.object as any;
    return time_end > object.time_start; // time_end must be greater than time_start
  }

  defaultMessage(args: ValidationArguments) {
    return 'time_end must be greater than time_start';
  }
}
export class UpdateProcessStandardStageDto {
  @ApiProperty({
    description: 'the uuid of the stage',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  process_technical_standard_stage_id: string;

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
  @IsNotEmpty()
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
    type: [UpdateProcessStandardStageMaterialDto],
  })
  @IsOptional()
  material: UpdateProcessStandardStageMaterialDto[];

  @ApiProperty({
    description: 'the content of the stage',
    type: [UpdateProcessStandardStageContentDto],
  })
  @IsOptional()
  content: UpdateProcessStandardStageContentDto[];

  @ApiProperty({
    description: 'the note of the stage',
  })
  @IsOptional()
  is_deleted: boolean;
}
