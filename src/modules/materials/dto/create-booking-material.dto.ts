import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBookingMaterialDto {
  @ApiProperty({
    description: 'the uuid of landrenter who booking material',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  landrenter_id: string;

  @ApiProperty({
    description: 'the uuid of booking',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  booking_id: string;
}
