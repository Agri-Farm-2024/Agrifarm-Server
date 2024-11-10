import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { RequestStatus } from '../types/request-status.enum';

export class UpdateStatusTaskDTO {
  @ApiProperty({
    required: true,
    description: 'Status of the task',
    name: 'status',
  })
  status: RequestStatus;

  @ApiProperty({
    required: false,
    description: 'Reason for reject',
  })
  @IsOptional()
  reason_for_reject: string;
}
