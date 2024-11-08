import { IsEnum, IsNotEmpty } from 'class-validator';
import { NotificationType } from '../types/notification-type.enum';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: string;

  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsNotEmpty({ message: 'Component is required' })
  component: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum({
    NotificationType,
    default: NotificationType.task,
  })
  type: string;
}
