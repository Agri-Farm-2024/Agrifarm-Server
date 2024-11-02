import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ProcessTechnicalStandardStatus } from '../types/status-processStandard.enum';

export class UpdateProcessStandardDto {
  @ApiProperty({
    description: 'the status of process',
    example: ProcessTechnicalStandardStatus.accepted,
  })
  @IsNotEmpty()
  status: ProcessTechnicalStandardStatus;

  @ApiProperty({
    description: 'the reason of reject',
    example: 'The process is not good',
  })
  reason_of_reject: string;
}
