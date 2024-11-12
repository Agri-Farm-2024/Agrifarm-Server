import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../types/booking-status.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BookingPaymentFrequency } from '../types/booking-payment.enum';

export class UpdateStatusBookingDTO {
  @ApiProperty({
    type: 'string',
    description: 'contract image of booking',
  })
  @IsOptional()
  contract_image: string;

  @ApiProperty({
    type: 'string',
    description: 'contract image of booking',
  })
  @IsOptional()
  reason_for_reject: string;

  @ApiProperty({
    type: 'string',
    description: 'payment frequency of booking',
    enum: BookingPaymentFrequency,
  })
  @IsEnum(BookingPaymentFrequency)
  @IsOptional()
  payment_frequency: BookingPaymentFrequency;

  @ApiProperty({
    type: 'string',
    description: 'status of booking',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty({ message: 'status is required' })
  status: BookingStatus;
}
