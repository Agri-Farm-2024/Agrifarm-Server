import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePlantDto {
  @ApiProperty({
    example: 'Plant Name',
    description: 'The name of the plant',
  })
  @IsNotEmpty({ message: 'Plant name is required' })
  name: string;
}
