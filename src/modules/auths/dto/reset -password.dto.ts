import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({
    type: String,
    description: 'email',
    required: true,
    example: 'landrenter@gmail.com',
  })
  @IsNotEmpty()
  email: string;
}
