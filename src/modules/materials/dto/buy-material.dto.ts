import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BuyMaterialDTO {
  @ApiProperty({
    example: '1',
    description: 'The material id',
  })
  @IsString()
  material_id: string;

  @ApiProperty({
    example: 1,
    description: 'The quantity of material',
  })
  quantity: number;
}
