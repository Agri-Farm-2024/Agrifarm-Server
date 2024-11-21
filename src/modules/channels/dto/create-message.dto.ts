import { ApiProperty } from '@nestjs/swagger';
import { ChannelMessageType } from '../types/channel-message-type.enum';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDTO {
  @ApiProperty({
    required: true,
    description: 'ID of channel that message is sent to',
    example: 'id of channel',
  })
  @IsNotEmpty()
  message_to_id: string;

  @ApiProperty({
    required: true,
    description: 'Content of message',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    enum: ChannelMessageType,
    default: ChannelMessageType.text,
    required: false,
  })
  @IsOptional()
  message_type: ChannelMessageType;
}
