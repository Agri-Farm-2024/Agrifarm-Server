import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UpdateProcessSpecificStageDto } from './update-process-specific-stage.dto';

export class UPdateProcessSpecificDto {
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
    description: 'the stage of process',
    type: [UpdateProcessSpecificStageDto],
  })
  @IsOptional()
  stage: UpdateProcessSpecificStageDto[];
}
