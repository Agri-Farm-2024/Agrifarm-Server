import { ApiProperty } from '@nestjs/swagger';
import { ReportUrlType } from '../types/report-url-type.enum';

export class ReportURLDTO {
  @ApiProperty({
    description: 'URL string',
    example: 'https://www.google.com',
    required: false,
  })
  url_string: string;

  @ApiProperty({
    description: 'URL type',
    example: ReportUrlType.image,
    required: false,
  })
  url_type: ReportUrlType;
}
export class CreateReportDTO {
  @ApiProperty({
    description: 'Report title',
    required: true,
  })
  content: string;

  @ApiProperty({
    description: 'Report description',
    required: false,
    type: [ReportURLDTO],
  })
  url: ReportURLDTO[];
}
