import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateServicePackageDTO {
  @ApiProperty({
    example: 'Dịch vụ vietgap + vật tư',
    description: 'The name of the service package',
    type: String,
  })
  @IsNotEmpty({
    message: 'Name is required',
  })
  name: string;

  @ApiProperty({
    example: 'Description of the service package',
    description: 'The description of the service package',
    type: String,
  })
  @IsNotEmpty({
    message: 'Description is required',
  })
  description: string;

  @ApiProperty({
    example: true,
    description: 'The process of plant',
    type: Boolean,
  })
  @IsNotEmpty({
    message: 'Process of plant is required',
  })
  process_of_plant: boolean;

  @ApiProperty({
    example: true,
    description: 'The material',
    type: Boolean,
  })
  @IsNotEmpty({
    message: 'Material is required',
  })
  material: boolean;

  @ApiProperty({
    example: true,
    description: 'The purchase',
    type: Boolean,
  })
  @IsNotEmpty({
    message: 'Purchase is required',
  })
  purchase: boolean;

  @ApiProperty({
    example: 1000000,
    description: 'The price of the service package',
    type: Number,
  })
  @IsNotEmpty({
    message: 'Price is required',
  })
  price: number;
}
