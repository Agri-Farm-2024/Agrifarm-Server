import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLandSubDescriptionDTO {
  @ApiProperty({
    description: 'The name of the land',
    example: 'Land 1',
  })
  @IsOptional()
  sub_title: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional() // Allows description to be null or undefined
  sub_description: string;
}
