import { Global, Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { UsersModule } from 'src/modules/users/users.module';

@Global()
@Module({
  providers: [EventGateway],
  exports: [EventGateway],
  imports: [UsersModule],
})
export class SocketsModule {}
