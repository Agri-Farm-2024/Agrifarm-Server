import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ToLowerCase } from 'src/common/decorations/makeLowerCaseText.decoration';

export class CreatePlantDto {
  @ApiProperty({
    description: 'The UUID of the land type',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsNotEmpty({ message: 'Land type is required' })
  land_type_id: string;

  @ApiProperty({
    example: 'Plant Name',
    description: 'The name of the plant',
  })
  @IsNotEmpty({ message: 'Plant name is required' })
  @ToLowerCase()
  name: string;
}
