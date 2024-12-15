import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProcessStandardDto {
  @ApiProperty({
    description: 'the reason of reject',
    example: 'The process is not good',
  })
  @IsOptional()
  reason_of_reject: string;
}
