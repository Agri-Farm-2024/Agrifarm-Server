import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DinaryURLType } from '../types/dinary-url-type.enum';

export class DinaryImageDto {
  @ApiProperty({
    description: 'Image of dinary',
    example: 'https://www.google.com.vn',
  })
  @IsString()
  @IsNotEmpty()
  url_link: string;

  @ApiProperty({
    description: 'Type of dinary',
    example: DinaryURLType.image,
    required: false,
  })
  @IsOptional()
  type: DinaryURLType;
}
export class CreateDinaryDto {
  @ApiProperty({
    description: 'Content of dianry',
    example: 'the stage is very good',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Quality report of dinary',
    example: 100,
  })
  @IsNotEmpty()
  quality_report: number;

  @ApiProperty({
    description: 'Image of dinary',
    type: [DinaryImageDto],
  })
  @IsNotEmpty()
  dinaries_image: DinaryImageDto[];
}
