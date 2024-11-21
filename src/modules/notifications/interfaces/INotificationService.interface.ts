import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateNotificationDTO } from '../dto/create-notification.dto';

export interface INotificationService {
  createNotification(message: string): void;

  getListNotificationByUserId(user_id: string, message: string): void;

  createNotification(data: CreateNotificationDTO): Promise<Notification>;

  getListByUser(userId: string, pagination: PaginationParams): Promise<any>;

  seen(userId: string): Promise<any>;
}
