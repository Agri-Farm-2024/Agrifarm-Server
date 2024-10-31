import { WebSocketGateway } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';

@WebSocketGateway()
export class SocketsGateway {
  constructor(private readonly socketsService: SocketsService) {}
}
