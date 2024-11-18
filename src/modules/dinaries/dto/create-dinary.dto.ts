import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DinaryImageDto {
  @ApiProperty({
    description: 'Image of dinary',
    example: 'https://www.google.com.vn',
  })
  @IsString()
  @IsNotEmpty()
  image_link: string;
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
