import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, Max, Min } from 'class-validator';
import { IsFutureDate } from 'src/common/decorations/isFutureTime.decoration';

export class CreateBookingDto {
  @ApiProperty({
    description: 'id of land',
    type: String,
  })
  @IsNotEmpty({
    message: 'You must enter a land ',
  })
  land_id: string;

  @ApiProperty({
    description: 'time start of booking',
    type: Date,
    example: '2022-12-12 00:00:00',
  })
  @IsNotEmpty({
    message: 'You must enter a total month ',
  })
  @Type(() => Date)
  @IsDate({
    message: 'Date must be a valid date format',
  })
  @IsFutureDate({
    message: 'Date must be in the future',
  })
  time_start: Date;

  @ApiProperty({
    description: 'total month of booking',
    type: Number,
    example: 12,
  })
  @IsNotEmpty({
    message: 'You must enter a total month ',
  })
  @Min(1, {
    message: 'Total month must be greater than 0',
  })
  @Max(36, {
    message: 'Total month must be less than 13',
  })
  total_month: number;

  @ApiProperty({
    description: 'purpose rental',
    type: String,
    example: 'rental for business',
  })
  @IsNotEmpty({
    message: 'You must enter a purpose rental ',
  })
  purpose_rental: string;
}
