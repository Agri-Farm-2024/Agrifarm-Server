import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({
    type: String,
    description: 'User ID',
    required: true,
  })
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: string;
}
