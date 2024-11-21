import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { ChannelJoin } from './entities/channelJoin.entity';
import { ChannelMessage } from './entities/channelMessage.entity';
import { IChannelService } from './interfaces/IChannelService.interface';
import { Payload } from '../auths/types/payload.type';
import { CreateMessageDTO } from './dto/create-message.dto';
import { ChannelStatus } from './types/channel-status.enum';

@Injectable()
export class ChannelsService implements IChannelService {
  private readonly logger = new Logger(ChannelsService.name);
  constructor(
    private readonly loggerService: LoggerService,

    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,

    @InjectRepository(ChannelJoin)
    private readonly channelJoinRepository: Repository<ChannelJoin>,

    @InjectRepository(ChannelMessage)
    private readonly channelMessageRepository: Repository<ChannelMessage>,
  ) {}

  /**
   * get list chat by user
   * @function getListChannelByUser
   * @param user
   * @returns
   */

  async getListChannelByUser(user: Payload): Promise<any> {
    try {
      const channels = await this.channelRepository.find({
        where: {
          joins: {
            user_join_id: user.user_id,
          },
        },
      });
      return channels;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async createMessage(data: CreateMessageDTO, user: Payload): Promise<any> {
    try {
      // Check channel is exist
      const channel_exist = await this.channelRepository.findOne({
        where: {
          channel_id: data.message_to_id,
        },
      });
      // Check channel is exist
      if (!channel_exist) {
        throw new Error('Channel is not exist');
      }
      // check channel is expired
      if (channel_exist.status === ChannelStatus.expired) {
        throw new Error('Channel is expired can not send message');
      }
      // check user is in channel
      const is_join = await this.channelJoinRepository.findOne({
        where: {
          channel_id: data.message_to_id,
          user_join_id: user.user_id,
        },
      });
      if (!is_join) {
        throw new Error('User is not in channel');
      }
      // Create message
      const message = await this.channelMessageRepository.save({
        ...data,
        user_id: user.user_id,
      });
      return message;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
