import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../types/booking-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateStatusBookingDTO {
  @ApiProperty({
    type: 'boolean',
    description: 'is schedule booking',
  })
  @IsOptional()
  is_schedule: boolean;

  @ApiProperty({
    type: 'string',
    description: 'status of booking',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
