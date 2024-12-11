import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRequestViewLandDTO {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  guest_email: string;

  @ApiProperty({
    example: 'Test',
    description: 'The full name of the user',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  guest_full_name: string;

  @ApiProperty({
    example: '123456789',
    description: 'The phone number of the user',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  guest_phone: string;

  @ApiProperty({
    example: "I'm interested in viewing the land",
    description: 'The description of the request',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: '2024-10-15 10:30:00',
    description: 'The start time for the request in "YYYY-MM-DD HH:mm:ss" format',
  })
  @Transform(({ value }) => value.replace(' ', 'T') + 'Z') // Transform input to ISO 8601 format
  @IsDateString({}, { message: 'Invalid date-time format' })
  time_start: string;
}
