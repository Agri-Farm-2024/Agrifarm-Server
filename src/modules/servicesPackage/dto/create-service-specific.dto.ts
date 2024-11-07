import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceSpecificDTO {
  @ApiProperty({
    example: '1',
    description: 'The id of the plant season',
  })
  plant_season_id: string;

  @ApiProperty({
    example: '1',
    description: 'The id of the booking',
  })
  booking_id: string;

  @ApiProperty({
    example: '1',
    description: 'The id of the service package',
  })
  service_package_id: string;

  @ApiProperty({
    example: 1,
    description: 'The acreage of the plant',
  })
  acreage_land: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'The start time of the service',
  })
  time_start: Date;
}
