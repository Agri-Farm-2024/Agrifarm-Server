import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateServiceSpecificDTO {
  @ApiProperty({
    example: '1',
    description: 'The id of the plant season',
  })
  @IsNotEmpty({
    message: 'plant_season_id is required',
  })
  plant_season_id: string;

  @ApiProperty({
    example: '1',
    description: 'The id of the booking',
  })
  @IsNotEmpty({
    message: 'booking_id is required',
  })
  booking_id: string;

  @ApiProperty({
    example: '1',
    description: 'The id of the service package',
  })
  @IsNotEmpty({
    message: 'service_package_id is required',
  })
  service_package_id: string;

  @ApiProperty({
    example: 1,
    description: 'The acreage of the plant',
  })
  @IsNotEmpty({
    message: 'acreage_plant is required',
  })
  acreage_land: number;

  @ApiProperty({
    example: '2025-01-01',
    description: 'The start time of the service',
  })
  @IsNotEmpty({
    message: 'time_start is required',
  })
  time_start: Date;
}
