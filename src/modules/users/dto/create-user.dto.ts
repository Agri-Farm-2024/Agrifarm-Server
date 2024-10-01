import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { UserRole } from 'src/utils/roles/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  full_name: string;

  @ApiProperty({
    example: 'http://example.com/avatar.jpg',
    description: 'The avatar URL of the user',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid avatar URL format' })
  avatar_url?: string;

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
  role: UserRole;
}
