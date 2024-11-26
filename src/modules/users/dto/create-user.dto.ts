import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../types/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'test1@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @ApiProperty({
    example: 'phone',
    description: 'The phone number of the user',
  })
  @IsNotEmpty({ message: 'Phone is required' })
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  phone: string;

  @ApiProperty({
    example: '/uploadFile/avatar.jpg',
    description: 'The avatar URL of the user',
    required: false,
  })
  @IsOptional()
  avatar_url: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The date of birth of the user',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  dob?: Date;

  @ApiProperty({
    example: UserRole.land_renter,
    description: 'The role of the user',
  })
  @IsOptional()
  role: number;
}
