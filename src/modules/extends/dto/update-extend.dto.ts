import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ExtendStatus } from '../types/extend-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExtendDTO {
  @ApiProperty({
    example: 'test.png',
    required: false,
  })
  @IsOptional()
  contract_image: string;

  @ApiProperty({
    example: 'Reason for reject',
    required: false,
  })
  @IsOptional()
  reason_for_reject: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Min(1, {
    message: 'Total month must be greater than 0',
  })
  @Max(12, {
    message: 'Total month must be less than 13',
  })
  total_month: number;

  @ApiProperty({
    enum: ExtendStatus,
    example: ExtendStatus.pending,
  })
  @IsNotEmpty({
    message: 'Status is required',
  })
  status: ExtendStatus;
}
