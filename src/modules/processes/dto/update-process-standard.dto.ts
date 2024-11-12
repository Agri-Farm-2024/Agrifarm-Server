import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UpdateProcessStandardStageDto } from './update-process-standard-stage.dto';
import { ToLowerCase } from 'src/common/decorations/makeLowerCaseText.decoration';

export class UpdateProcessStandardsDto {
  @ApiProperty({
    description: 'the name process',
    example: 'Process 1',
  })
  @ToLowerCase()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the stage of process',
    type: [UpdateProcessStandardStageDto],
  })
  @IsOptional()
  stage: UpdateProcessStandardStageDto[];
}
