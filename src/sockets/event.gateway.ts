// notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
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

  sendNotification(userId: string, message: string) {
    // Broadcast message to the specific user
    const client = this.clients[userId];
    if (client) {
      client.emit('notification', { message });
    }
  }
}
