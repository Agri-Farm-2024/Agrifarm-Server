import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ProcessSpecificStatus } from '../types/processSpecific-status.enum';

export class UpdateProcessSpecificStatusDto {
  @ApiProperty({
    description: 'the status of process specific',
    example: 'active',
  })
  @IsNotEmpty()
  status: ProcessSpecificStatus;
}
