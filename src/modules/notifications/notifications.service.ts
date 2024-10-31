import { Injectable } from '@nestjs/common';
import { SocketsGateway } from '../sockets/sockets.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly socketGateway: SocketsGateway) {}
}
