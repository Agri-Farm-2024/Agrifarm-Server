// notification.gateway.ts
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './types/socket-event.enum';
import { LoggerService } from 'src/logger/logger.service';
import { UsersService } from 'src/modules/users/users.service';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { Channel } from 'src/modules/channels/entities/channel.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins
    credentials: false, // Do not allow credential
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventGateway.name);
  constructor(
    private readonly loggerService: LoggerService,

    private readonly userService: UsersService,

    private readonly channelService: ChannelsService,
  ) {}

  @WebSocketServer()
  server: Server;

  private clients: { [key: string]: Socket } = {};

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Listen for online-user event
    client.on('online-user', async (userId: string) => {
      if (userId) {
        this.clients[userId] = client;
        this.logger.log(`User online: ${userId} (Socket ID: ${client.id})`);
        this.loggerService.log(`User online: ${userId} (Socket ID: ${client.id})`);
        // Join the room of channel with the user role
        const list_channel_by_user: Channel[] =
          await this.channelService.getListChannelByUser(userId);
        list_channel_by_user.forEach((channel) => {
          client.join(`${channel.channel_id}`);
          this.logger.log(`User join channel: ${channel.channel_id} (Socket ID: ${client.id})`);
          this.loggerService.log(
            `User join channel: ${channel.channel_id} (Socket ID: ${client.id})`,
          );
        });
      } else {
        this.logger.warn(`online-user event missing userId for Socket ID: ${client.id}`);
      }
    });
  }

  handleDisconnect(client: Socket) {
    // Remove client from the list of connected clients
    const userId = Object.keys(this.clients).find((key) => this.clients[key].id === client.id);

    if (userId) {
      delete this.clients[userId];
      this.logger.log(`User offline: ${userId} (Socket ID: ${client.id})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id} (no associated userId)`);
      this.loggerService.log(`Client disconnected: ${client.id} (no associated userId)`);
    }
  }

  sendEventToUserId(userId: string, message: any, event: SocketEvent) {
    // Broadcast message to the specific user
    const client = this.clients[userId];
    if (client) {
      client.emit(`${event}`, { message });
    }
  }

  sendEventToGroup(groupId: string, message: any, event: SocketEvent) {
    // Broadcast message to the group
    this.logger.log(`Send ${event} to group: ${groupId}`);
    this.loggerService.log(`Send ${event} to group: ${groupId}`);
    this.server.to(groupId).emit(`${event}`, { message });
  }
}
