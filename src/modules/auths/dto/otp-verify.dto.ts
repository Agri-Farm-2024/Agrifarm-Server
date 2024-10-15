import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class OTPVerifyDTO {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 123456,
    description: 'The OTP code',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: number;
}
