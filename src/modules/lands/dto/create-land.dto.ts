import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { ToLowerCase } from 'src/common/decorations/makeLowerCaseText.decoration';

export class CreateLandDto {
  @ApiProperty({
    description: 'The name of the land',
    example: 'Land 1',
  })
  @IsNotEmpty()
  @ToLowerCase()
  name: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'the description of the land',
    example: 'Land 1 is a beautiful land with a lot of trees',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'the acreage of the land',
    example: 100,
  })
  @IsNotEmpty()
  @IsPositive()
  acreage_land: number;

  @ApiProperty({
    description: 'The price of booking per month',
    example: 100,
  })
  @IsNotEmpty()
  @IsPositive()
  price_booking_per_month: number;

  @ApiProperty({
    description: 'the id of the land type',
    example: '1',
  })
  @IsNotEmpty()
  land_type_id: string;

  @ApiProperty({
    description: 'The image url of the land',
    type: [], // Correct way to specify array type
    example: [
      'https://www.google.com.vn/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
    ],
  })
  @IsOptional()
  images: string[];

  @ApiProperty({
    description: 'The video url of the land',
    type: [], // Correct way to specify array type
    example: [
      'https://www.youtube.com/watch?v=8p9jSRxJ8jw',
      'https://www.youtube.com/watch?v=8p9jSRxJ8jw',
    ],
  })
  @IsOptional()
  videos: string[];
}
