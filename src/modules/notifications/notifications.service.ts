import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { EventGateway } from 'src/sockets/event.gateway';
import { SocketEvent } from 'src/sockets/types/socket-event.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

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
    // // send socket to the group of user
    // this.eventGateway.sendEventToGroup(
    //   data.user_id,
    //   notification,
    //   SocketEvent.notification,
    // );
    return this.notificationRepository.save(notification);
  }

  async getListByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      const [notifications, total_count, total_is_not_seen] = await Promise.all(
        [
          this.notificationRepository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            skip: (pagination.page_index - 1) * pagination.page_size,
            take: pagination.page_size,
          }),
          this.notificationRepository.count({ where: { user_id: userId } }),
          this.notificationRepository.count({
            where: { user_id: userId, is_seen: false },
          }),
        ],
      );
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);

      return {
        notifications,
        total_is_not_seen,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {}
  }

  async seen(userId: string): Promise<any> {
    try {
      await this.notificationRepository.update(
        { user_id: userId },
        { is_seen: true },
      );
      return { message: 'Seen all notifications' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
