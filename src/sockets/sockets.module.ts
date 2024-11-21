import { Global, Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { UsersModule } from 'src/modules/users/users.module';
import { ChannelsModule } from 'src/modules/channels/channels.module';

@Global()
@Module({
  providers: [EventGateway],
  exports: [EventGateway],
  imports: [UsersModule, ChannelsModule],
})
export class SocketsModule {}
