import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRequestPurchaseDto {
  @ApiProperty({
    description: 'the uid service specific of landrenter',
    example: '1bbf4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b',
  })
  @IsNotEmpty()
  service_specific_id: string;
}
