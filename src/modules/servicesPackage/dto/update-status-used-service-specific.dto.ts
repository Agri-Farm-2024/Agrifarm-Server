import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStatusUsedServiceSpecificDTO {
  @ApiProperty({
    description: 'image of contract',
    example: 'image',
  })
  @IsNotEmpty()
  contract_image: string;
}
