import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRequestProcessStandardDTO {
  @ApiProperty({
    description: 'the plant season id of reuqest create process standard',
    example: 'e1b1b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
  })
  @IsNotEmpty()
  plant_season_id: string;
}
