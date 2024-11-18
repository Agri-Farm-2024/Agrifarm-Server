import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { EventGateway } from 'src/sockets/event.gateway';
import { SocketEvent } from 'src/sockets/types/socket-event.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly eventGateway: EventGateway,
  ) {}

  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await this.notificationRepository.save({
      ...data,
    });
    // send socket to the user
    this.eventGateway.sendEventToUserId(
      data.user_id,
      notification,
      SocketEvent.notification,
    );
    return this.notificationRepository.save(notification);
  }
}
