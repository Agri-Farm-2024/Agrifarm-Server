import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UpdateProcessSpecificStageContentDto {
  @ApiProperty({
    description: 'the UUID of the process specific stage content',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  process_technical_specific_stage_content_id: string;

  @ApiProperty({
    description: 'the title of the stage content',
    example: 'Stage 1 Content',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'the content of the stage content',
    example: 'content of stage 1',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'the numberic_order of the stage content',
    example: 1,
  })
  @IsOptional()
  @Min(1)
  content_numberic_order: number;

  @ApiProperty({
    description: 'time start of the stage content',
    example: new Date(),
  })
  @IsNotEmpty()
  time_start: Date;

  @ApiProperty({
    description: 'time end of the stage content',
    example: new Date(),
  })
  @IsNotEmpty()
  time_end: Date;

  @ApiProperty({
    description: 'the content is deleted',
  })
  @IsOptional()
  is_deleted: boolean;
}
