import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserStatus } from '../types/user-status.enum';

export class UpdateStatusUserDto {
  @ApiProperty({
    description: 'User status',
    example: 'active',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
