import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty } from 'class-validator';

export class GetAccessTokenDto {
  @ApiProperty({
    type: String,
    description: 'The refresh token',
  })
  @IsEmpty({
    message: 'The refresh token is required',
  })
  refreshToken: string;
}
