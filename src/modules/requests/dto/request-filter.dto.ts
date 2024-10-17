import { IsEnum, IsOptional } from 'class-validator';
import { RequestType } from '../types/request-type.enum';
import { RequestStatus } from 'src/utils/status/request-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ApplyPaginationMetadata } from 'src/common/decorations/pagination.decoration';

export class RequestFilterDTO {
  @ApiProperty({
    type: 'enum',
    enum: RequestType,
    description: 'Type of request',
    required: false,
    nullable: true,
  })
  @IsEnum(RequestType)
  @IsOptional()
  type: RequestType;

  @ApiProperty({
    type: 'enum',
    enum: RequestStatus,
    description: 'Status of request',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
