import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDTO } from './dto/create-message.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Payload } from '../auths/types/payload.type';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(AuthGuard)
  @Post('/messages')
  async createMessage(@Body() data: CreateMessageDTO, @Request() req: any) {
    const user: Payload = req['user'];
    return this.channelsService.createMessage(data, user.user_id);
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getListChannelByUser(@Request() req: any) {
    const user: Payload = req['user'];
    return this.channelsService.getListChannelByUser(user.user_id);
  }

  @UseGuards(AuthGuard)
  @Get('/messages/:channel_id')
  async getMessagesByChannel(
    @Request() req: any,
    @Param('channel_id') channel_id: string,
  ) {
    const user: Payload = req['user'];
    return this.channelsService.getListMessageByChannelId(
      channel_id,
      user.user_id,
    );
  }
}
