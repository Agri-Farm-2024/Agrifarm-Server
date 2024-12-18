import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { Channel } from './entities/channel.entity';
import { LessThan, Repository } from 'typeorm';
import { ChannelJoin } from './entities/channelJoin.entity';
import { ChannelMessage } from './entities/channelMessage.entity';
import { IChannelService } from './interfaces/IChannelService.interface';
import { CreateMessageDTO } from './dto/create-message.dto';
import { ChannelStatus } from './types/channel-status.enum';
import { EventGateway } from 'src/sockets/event.gateway';
import { SocketEvent } from 'src/sockets/types/socket-event.enum';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { selectUser } from 'src/utils/select.util';

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

    @Inject(forwardRef(() => EventGateway))
    private readonly eventGateway: EventGateway,
  ) {}

  /**
   * get list chat by user
   * @function getListChannelByUser
   * @param user
   * @returns
   */

  async getListChannelByUser(user_id: string): Promise<any> {
    try {
      // get list channel by user
      const channels: any = await this.channelRepository.find({
        where: {
          joins: {
            user_join_id: user_id,
          },
        },
        relations: {
          request: true,
        },
        order: {
          messages: {
            updated_at: 'DESC',
          },
        },
      });
      // get newest message
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const newest_message = await this.channelMessageRepository.findOne({
          where: {
            message_to_id: channel.channel_id,
          },
          relations: {
            message_from: true,
          },
          order: {
            created_at: 'DESC',
          },
          select: {
            message_from: selectUser,
          },
        });
        channel.newest_message = newest_message;
      }
      return channels;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  /**
   * create message
   * @function createMessage
   * @param data
   * @param user
   * @returns
   */

  async createMessage(data: CreateMessageDTO, user_id: string): Promise<any> {
    try {
      // Check channel is exist
      const channel_exist = await this.channelRepository.findOne({
        where: {
          channel_id: data.message_to_id,
        },
      });
      // Check channel is exist
      if (!channel_exist) {
        throw new BadRequestException('Channel is not exist');
      }
      // check channel is expired
      if (channel_exist.status === ChannelStatus.expired) {
        throw new BadRequestException('Channel is expired can not send message');
      }
      // check user is in channel
      const is_join = await this.channelJoinRepository.findOne({
        where: {
          channel_id: data.message_to_id,
          user_join_id: user_id,
        },
      });
      if (!is_join) {
        throw new BadRequestException('User is not in channel');
      }
      // Create message
      const message = await this.channelMessageRepository.save({
        ...data,
        message_from_id: user_id,
      });
      // send socket message to channel
      this.eventGateway.sendEventToGroup(data.message_to_id, message, SocketEvent.message);
      return message;
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * get list message by channel id
   * @function getListMessageByChannelId
   * @param channel_id
   * @param user
   * @returns
   */

  async getListMessageByChannelId(channel_id: string, user_id: string): Promise<any> {
    try {
      // check user is in channel
      const is_join = await this.channelJoinRepository.findOne({
        where: {
          channel_id: channel_id,
          user_join_id: user_id,
        },
      });
      if (!is_join) {
        throw new ForbiddenException('You are not in channel');
      }
      // get list message
      const messages = await this.channelMessageRepository.find({
        where: {
          message_to_id: channel_id,
        },
        relations: {
          message_from: true,
        },
        select: {
          message_from: selectUser,
        },
      });
      return messages;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createChannel(data: CreateChannelDTO): Promise<any> {
    try {
      const channel = await this.channelRepository.save({
        request_id: data.request_id,
      });
      // create join for sender and expert
      await this.channelJoinRepository.save({
        channel_id: channel.channel_id,
        user_join_id: data.sender_id,
      });
      await this.channelJoinRepository.save({
        channel_id: channel.channel_id,
        user_join_id: data.expert_id,
      });
      // create first message for channel
      await this.channelMessageRepository.save({
        message_from_id: data.sender_id,
        message_to_id: channel.channel_id,
        content: data.description,
      });
      return channel;
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  async addAssignToChannel(request_id: string, user_id: string): Promise<any> {
    try {
      // check channel is exist
      const channel = await this.channelRepository.findOne({
        where: {
          request_id: request_id,
        },
      });
      if (!channel) {
        throw new BadRequestException('Channel is not exist');
      }
      // check channel is expired
      if (channel.status === ChannelStatus.expired) {
        throw new BadRequestException('Channel is expired');
      }
      // check user is in channel
      const is_join = await this.channelJoinRepository.findOne({
        where: {
          channel_id: channel.channel_id,
          user_join_id: user_id,
        },
      });
      if (is_join) {
        throw new BadRequestException('User is already in channel');
      }
      // create join
      await this.channelJoinRepository.save({
        channel_id: channel.channel_id,
        user_join_id: user_id,
      });
      // update channel expired
      await this.channelRepository.update(
        {
          channel_id: channel.channel_id,
        },
        {
          expired_at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      );
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * set channel to expired after 7 days call when create report
   * @function
   * @param request_id
   */

  async setChannelToExpired(request_id: string): Promise<any> {
    try {
      const channel = await this.channelRepository.findOne({
        where: {
          request_id: request_id,
        },
      });
      // check channel is exist
      if (!channel) {
        throw new BadRequestException('Channel is not exist');
      }
      // update channel expired after 7 days
      await this.channelRepository.update(
        {
          channel_id: channel.channel_id,
        },
        {
          status: ChannelStatus.expired,
          expired_at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      );
      // logger
      this.logger.log(`Set channel to expired: ${request_id}`);
      this.loggerService.log(`Set channel to expired: ${request_id}`);
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkingChannelIsExpired(): Promise<any> {
    try {
      // get list channel is expired
      const channels = await this.channelRepository.find({
        where: {
          status: ChannelStatus.expired,
          expired_at: LessThan(new Date()),
        },
      });
      // set channel to expired
      for (let i = 0; i < channels.length; i++) {
        // remove join
        await this.channelJoinRepository.delete({
          channel_id: channels[i].channel_id,
        });
        // remove message
        await this.channelMessageRepository.delete({
          message_to_id: channels[i].channel_id,
        });
        // remove channel
        await this.channelRepository.delete({
          channel_id: channels[i].channel_id,
        });
        this.logger.log(`Channel is deleted: ${channels[i].channel_id}`);
        this.loggerService.log(`Channel is deleted: ${channels[i].channel_id}`);
      }
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
    }
  }
}
