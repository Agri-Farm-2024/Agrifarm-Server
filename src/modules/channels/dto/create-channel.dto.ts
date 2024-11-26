import { IsNotEmpty } from 'class-validator';

export class CreateChannelDTO {
  @IsNotEmpty()
  request_id: string;

  @IsNotEmpty()
  sender_id: string;

  @IsNotEmpty()
  expert_id: string;
}
