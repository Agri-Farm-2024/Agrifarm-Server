import { ApiProperty } from '@nestjs/swagger';
import { ReportUrlType } from '../types/report-url-type.enum';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class ReportURLDTO {
  @ApiProperty({
    description: 'URL string',
    example: 'https://www.google.com',
    required: false,
  })
  @IsOptional()
  url_link: string;

  @ApiProperty({
    description: 'URL type',
    example: ReportUrlType.image,
    required: false,
  })
  @IsNotEmpty()
  url_type: ReportUrlType;
}
export class CreateReportDTO {
  @ApiProperty({
    description: 'Report title',
    required: true,
  })
  @IsNotEmpty({
    message: 'Report title is required',
  })
  content: string;

  @ApiProperty({
    description: 'Report description',
    required: false,
    type: [ReportURLDTO],
  })
  @IsOptional()
  url: ReportURLDTO[];
}
