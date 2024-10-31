export interface INotificationService {
  createNotification(message: string): void;

  getListNotificationByUserId(user_id: string, message: string): void;
}
