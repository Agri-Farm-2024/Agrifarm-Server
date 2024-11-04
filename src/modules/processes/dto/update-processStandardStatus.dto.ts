import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ProcessTechnicalStandardStatus } from '../types/status-processStandard.enum';

export class UpdateProcessStandardDto {
  @ApiProperty({
    description: 'the reason of reject',
    example: 'The process is not good',
  })
  @IsOptional()
  reason_of_reject: string;
}
