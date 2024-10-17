import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { LandStatus } from 'src/utils/status/land-status.enum';

export class CreateLandDto {
  @ApiProperty({
    description: 'The name of the land',
    example: 'Land 1',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional() // Allows description to be null or undefined
  description: string;

  @ApiProperty({
    description: 'the acreage of the land',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  acreage_land: number;

  @ApiProperty({
    description: ' the UUID of the staff who manages the land',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional() // Allows staff_id to be null or undefined
  @IsUUID()
  staff_id: string | null;

  @ApiProperty({
    description: 'The price of booking per month',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price_booking_per_month: number;

  @ApiProperty({
    description: 'The status of the land',
    example: LandStatus.free,
  })
  @IsNotEmpty()
  @IsEnum(LandStatus)
  status: LandStatus;
}
