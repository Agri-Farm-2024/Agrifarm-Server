import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createProcessSpecificDTO {
  @ApiProperty({
    type: String,
    description: 'Service specific id',
  })
  @IsNotEmpty()
  service_specific_id: string;
}
