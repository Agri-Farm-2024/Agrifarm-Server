// notification.gateway.ts
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: { [key: string]: Socket } = {};

  handleConnection(client: Socket) {
    this.clients[client.id] = client;
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    delete this.clients[client.id];
    console.log(`Client disconnected: ${client.id}`);
  }

  sendEventByUserId(userId: string, message: any, event: string) {
    // Broadcast message to the specific user
    const client = this.clients[userId];
    if (client) {
      client.emit(`${event}`, { message });
    }
  }

  sendEventToGroup(groupId: string, message: any, event: string) {
    // Broadcast message to the group
    this.server.to(groupId).emit(`${event}`, { message });
  }
}
