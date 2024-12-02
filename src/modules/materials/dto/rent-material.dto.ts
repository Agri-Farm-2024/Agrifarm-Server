import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BuyMaterialDTO } from './buy-material.dto';

export class RentMaterialDto {
  @ApiProperty({
    description: 'The materials',
    type: [BuyMaterialDTO],
  })
  @IsNotEmpty()
  materials: BuyMaterialDTO[];

  @ApiProperty({
    example: '1',
    description: 'The booking id',
  })
  @IsNotEmpty({
    message: 'Booking id is required',
  })
  booking_land_id: string;
}
