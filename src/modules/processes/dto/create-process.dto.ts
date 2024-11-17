import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProcessStageDto } from './create-process-stage.dto';
import { ToLowerCase } from 'src/common/decorations/makeLowerCaseText.decoration';
export class CreateProcessDto {
  @ApiProperty({
    description: 'the UUID of the plant',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({
    message: 'Plant season id is required',
  })
  plant_season_id: string;

  @ApiProperty({
    description: 'the name process',
    example: 'Process 1',
  })
  @ToLowerCase()
  @IsNotEmpty({
    message: 'Name of process is required',
  })
  name: string;

  @ApiProperty({
    description: 'the stage of process',
    type: [CreateProcessStageDto],
  })
  @IsOptional()
  stage: CreateProcessStageDto[];
}
