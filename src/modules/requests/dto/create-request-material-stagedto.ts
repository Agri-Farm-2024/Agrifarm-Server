import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequestMaterialDto {
  @ApiProperty({
    description: 'the id process specific stage ',
    example: 'e1b1b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
  })
  @IsNotEmpty()
  @IsString()
  process_technical_specific_stage_id: string;
}
