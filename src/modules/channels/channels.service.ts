import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { ChannelJoin } from './entities/channelJoin.entity';
import { ChannelMessage } from './entities/channelMessage.entity';
import { IChannelService } from './interfaces/IChannelService.interface';
import { Payload } from '../auths/types/payload.type';

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
}
