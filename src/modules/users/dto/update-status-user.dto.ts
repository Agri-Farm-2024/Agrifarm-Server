import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusUserDto {
  @ApiProperty({
    description: 'User status',
    example: 'active',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  status: string;
}
