import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelJoin } from './entities/channelJoin.entity';
import { ChannelMessage } from './entities/channelMessage.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService],
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelJoin, ChannelMessage]),
    JwtModule,
  ],
})
export class ChannelsModule {}
