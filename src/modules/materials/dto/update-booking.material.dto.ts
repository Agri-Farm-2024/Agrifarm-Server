import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BookingMaterialStatus } from '../types/booking-material-status.enum';

export class UpdateBookingMaterialDTO {
  @ApiProperty({
    description: 'Status of booking',
    example: BookingMaterialStatus.completed,
    enum: BookingMaterialStatus,
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
