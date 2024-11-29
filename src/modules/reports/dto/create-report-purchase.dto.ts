import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ReportURLDTO } from './create-report.dto';

export class CreateReportPurchaseDto {
  @ApiProperty({
    description: 'the content of report purchase',
    example: 'the plant have a good quality',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: ' the quality  plant ',
    example: 100,
  })
  @IsOptional()
  @Min(1)
  @Max(100)
  quality_plant: number;

  @ApiProperty({
    description: ' the quality  plant expected ',
    example: 100,
  })
  @IsOptional()
  @Min(1)
  @Max(100)
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
