import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min, Validate } from 'class-validator';
import { IsTimeEndGreaterThanStart } from 'src/common/decorations/isTimeEndGreaterThanStart.decoration';

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
  @IsOptional()
  @Min(1)
  content_numberic_order: number;

  @ApiProperty({
    description: 'the content of the stage',
    example: 'content 1',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: ' time start of the stagecontent',
    example: 1,
  })
  @IsNotEmpty()
  @Min(1)
  time_start: number;

  @ApiProperty({
    description: 'time end of the stage content',
    example: 1,
  })
  @IsNotEmpty()
  @Validate(IsTimeEndGreaterThanStart, {
    message: 'time_end must be greater than time_start',
  })
  time_end: number;
}
