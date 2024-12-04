import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BookingMaterialStatus } from '../types/booking-material-status.enum';

export class UpdateBookingMaterialDTO {
  @ApiProperty({
    description: 'Booking ID',
    example: '1',
  })
  @IsNotEmpty()
  booking_id: string;

  @ApiProperty({
    type: BookingMaterialStatus,
    description: 'Status of booking',
    example: BookingMaterialStatus.completed,
  })
  @IsEnum(BookingMaterialStatus)
  @IsNotEmpty()
  status: BookingMaterialStatus;

  @ApiProperty({
    description: 'contract image',
    example: '1',
  })
  @IsOptional()
  contract_image: string;
}
