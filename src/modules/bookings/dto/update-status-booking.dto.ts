import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../types/booking-status.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

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
    description: 'status of booking',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty({ message: 'status is required' })
  status: BookingStatus;
}
