import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDinaryDto, DinaryImageDto } from './create-dinary.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateDinaryDto {
  @ApiProperty({
    description: 'Content of dianry',
    example: 'the stage is very good',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Quality report of dinary',
    example: 90,
  })
  @IsNotEmpty()
  quality_report: number;

  @ApiProperty({
    description: ' the image of dinary',
    type: [DinaryImageDto],
  })
  @IsNotEmpty()
  dinaries_image: DinaryImageDto[];
}
