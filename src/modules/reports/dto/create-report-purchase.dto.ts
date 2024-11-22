import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { QualityPurchaseType } from '../types/quality-type-purchase.enum';
import { ReportURLDTO } from './create-report.dto';

export class CreateReportPurchaseDto {
  @ApiProperty({
    description: 'the content of report purchase',
    example: 'the plant have a good quality',
  })
  @IsOptional()
  content: string;

  @ApiProperty({
    description: ' the quality  plant ',
    example: QualityPurchaseType.hight,
  })
  @IsOptional()
  quality_plant: number;

  @ApiProperty({
    description: ' the quality  plant expected ',
    example: QualityPurchaseType.hight,
  })
  @IsOptional()
  quality_plant_expect: number;

  @ApiProperty({
    description: ' the mass of plant ',
    example: 1000,
  })
  @IsOptional()
  mass_plant: number;

  @ApiProperty({
    description: ' the mass of plant expected ',
    example: 1000,
  })
  @IsOptional()
  mass_plant_expect: number;

  @ApiProperty({
    description: 'the url of report',
    required: false,
    type: [ReportURLDTO],
  })
  @IsOptional()
  url: ReportURLDTO[];
}
