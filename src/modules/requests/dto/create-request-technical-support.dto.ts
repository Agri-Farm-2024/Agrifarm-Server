import { ApiProperty } from '@nestjs/swagger';
import { RequestSupportType } from '../types/request-support-type.enum';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class createRequestTechnicalSupportDTO {
  @ApiProperty({
    example: 'id of service',
    description: 'Type of request',
    required: false,
  })
  @IsOptional()
  service_specific_id: string;

  @ApiProperty({
    enum: RequestSupportType,
    example: RequestSupportType.direct,
    description: 'Type of support',
  })
  @IsNotEmpty()
  support_type: RequestSupportType;

  @ApiProperty({
    example: 'Description of request',
    description: 'Type of request',
  })
  @IsNotEmpty()
  description: string;
}
