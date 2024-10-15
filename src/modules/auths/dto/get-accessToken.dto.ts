import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetAccessTokenDto {
  @ApiProperty({
    type: String,
    description: 'The refresh token',
  })
  @IsNotEmpty({
    message: 'The refresh token is required',
  })
  refreshToken: string;
}
