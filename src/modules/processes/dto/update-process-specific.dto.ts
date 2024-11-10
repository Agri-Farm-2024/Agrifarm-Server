import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UpdateProcessSpecificStageDto } from './update-process-specific-stage.dto';

export class UPdateProcessSpecificDto {
  @ApiProperty({
    description: 'the UUID of the process specific',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  process_technical_specific_id: string;

  @ApiProperty({
    description: 'time start of processSpecific',
  })
  @IsNotEmpty()
  time_start: Date;

  @ApiProperty({
    description: 'time end of processSpecific',
  })
  @IsNotEmpty()
  time_end: Date;

  @ApiProperty({
    description: 'qr url of processSpecific',
  })
  @IsOptional()
  qr_url: string;

  @ApiProperty({
    description: 'the stage of process',
    type: [UpdateProcessSpecificStageDto],
  })
  @IsOptional()
  stage: UpdateProcessSpecificStageDto[];
}
