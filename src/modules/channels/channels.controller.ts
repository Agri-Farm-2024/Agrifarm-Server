import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDTO } from './dto/create-message.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(AuthGuard)
  @Post('/messages')
  async createMessage(@Body() data: CreateMessageDTO, @Request() req: any) {
    const user = req['user'];
    return this.channelsService.createMessage(data, user);
  }
}
