import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { LandURLType } from '../types/land-url-type.enum';

class UpdateLandURLDTO {
  @ApiProperty({
    description: 'The id of the image',
    example: '1',
  })
  @IsString()
  @IsOptional()
  land_url_id: string;

  @ApiProperty({
    description: 'The url of the image',
    example: 'https://www.google.com.vn',
  })
  @IsString()
  @IsOptional()
  string_url: string;

  @ApiProperty({
    description: 'The url of the image',
    required: false,
    enum: LandURLType,
  })
  @IsOptional()
  type: LandURLType;
}
export class UpdateLandDTO {
  @ApiProperty({
    description: 'The name of the land',
    example: 'Land 1',
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional() // Allows description to be null or undefined
  title: string;

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
  @IsOptional()
  @IsNumber()
  @IsPositive()
  acreage_land: number;

  @ApiProperty({
    description: 'The price of booking per month',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price_booking_per_month: number;

  @ApiProperty({
    description: 'Staff id',
    example: '1',
  })
  @IsString()
  @IsOptional()
  staff_id: string;

  @ApiProperty({
    description: 'land type id',
    example: '1',
  })
  @IsOptional()
  land_type_id: string;

  @ApiProperty({
    description: 'The update url of the land',
    type: [UpdateLandURLDTO],
  })
  @IsOptional()
  url: UpdateLandURLDTO[];

  @ApiProperty({
    description: 'The url to be deleted',
    type: [UpdateLandURLDTO],
  })
  @IsOptional()
  url_deleted: UpdateLandURLDTO[];
}
