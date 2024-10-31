import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateLandTypeDto {
  @ApiProperty({
    description: 'Name of the land type',
    example: 'Rice Field',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the land type',
    example: 'Rice Field is a type of land that is suitable for planting rice',
  })
  @IsNotEmpty()
  description: string;
}
