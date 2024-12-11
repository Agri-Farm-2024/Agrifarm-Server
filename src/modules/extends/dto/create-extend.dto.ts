import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Max, Min } from 'class-validator';

export class CreateExtendDto {
  @ApiProperty({
    example: '1',
    description: `Booking id`,
  })
  @IsNotEmpty({
    message: `Booking id is required`,
  })
  booking_land_id: string;

  @ApiProperty({
    example: '1',
    description: `Extend month`,
  })
  @IsNotEmpty({
    message: `Total month is required`,
  })
  @Min(1, {
    message: `Total month must be greater than or equal to 1`,
  })
  @Max(36, {
    message: `Total month must be less than or equal to 12`,
  })
  total_month: number;
}
