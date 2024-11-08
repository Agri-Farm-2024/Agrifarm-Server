import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProcessStandardStageMaterialDto {
  @ApiProperty({
    description: 'the uuid of the stage material',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  process_technical_standard_stage_material_id: string;

  @ApiProperty({
    description: 'the material id',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  material_id: string;

  @ApiProperty({
    description: 'the quantity of the material',
    example: 10,
  })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'the material is deleted',
  })
  @IsOptional()
  is_deleted: boolean;
}
