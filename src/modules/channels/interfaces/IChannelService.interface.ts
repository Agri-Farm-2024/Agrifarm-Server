import { CreateChannelDTO } from '../dto/create-channel.dto';
import { CreateMessageDTO } from '../dto/create-message.dto';

export interface IChannelService {
  getListChannelByUser(user_id: string): Promise<any>;

  createMessage(data: CreateMessageDTO, user_id: string): Promise<any>;

  getListMessageByChannelId(channel_id: string, user_id: string): Promise<any>;

  createChannel(data: CreateChannelDTO): Promise<any>;

  addAssignToChannel(request_id: string, user_id: string): Promise<any>;
}
