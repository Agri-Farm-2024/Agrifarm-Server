import { APP_FILTER } from '@nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
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
export class CreateProcessStageContentDto {
  @ApiProperty({
    description: 'the title of the stage content',
    example: 'title 1',
  })
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'the numberic_order of the stage content',
    example: 1,
  })
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  numberic_order: number;

  @ApiProperty({
    description: 'the content of the stage',
    example: 'content 1',
  })
  @IsOptional()
  content: string;

  @ApiProperty({
    description: ' time start of the stagecontent',
    example: 1,
  })
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  time_start: number;

  @ApiProperty({
    description: 'time end of the stage content',
    example: 1,
  })
  @IsNotEmpty()
  @IsOptional()
  @Validate(IsTimeEndGreaterThanStart, {
    message: 'time_end must be greater than time_start',
  })
  time_end: number;
}
