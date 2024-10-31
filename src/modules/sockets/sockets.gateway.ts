// notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Store online users and their socket IDs
  private onlineUsers = new Map<string, string[]>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSockets = this.onlineUsers.get(userId) || [];
      userSockets.push(client.id);
      this.onlineUsers.set(userId, userSockets);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const userSockets = this.onlineUsers.get(userId) || [];
      const newSockets = userSockets.filter(
        (socketId) => socketId !== client.id,
      );
      newSockets.length
        ? this.onlineUsers.set(userId, newSockets)
        : this.onlineUsers.delete(userId);
    }
  }

  // Emit notification to online user(s)
  sendToUser(user_id: string, data: any) {
    const userSockets = this.onlineUsers.get(user_id);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', data);
      });
    }
  }
}
