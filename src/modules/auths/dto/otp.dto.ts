import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class OTPDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
