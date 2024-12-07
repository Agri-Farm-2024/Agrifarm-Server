import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { IsFutureDate } from 'src/common/decorations/isFutureTime.decoration';
import { BookingPaymentFrequency } from '../types/booking-payment.enum';
import { ResetToStartOfDay } from 'src/common/decorations/resetToStartOfDay.decoration';

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
  @IsFutureDate({
    message: 'Date must be in the future',
  })
  @ResetToStartOfDay()
  time_start: Date;

  @ApiProperty({
    description: 'total month of booking',
    type: Number,
    example: 12,
  })
  @IsNotEmpty({
    message: 'You must enter a total month ',
  })
  @Min(6, {
    message: 'Total month must be greater than 6',
  })
  @Max(36, {
    message: 'Total month must be less than 36',
  })
  total_month: number;

  @ApiProperty({
    type: 'string',
    description: 'payment frequency of booking',
    enum: BookingPaymentFrequency,
  })
  @IsEnum(BookingPaymentFrequency)
  @IsOptional()
  payment_frequency: BookingPaymentFrequency;

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
