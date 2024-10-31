import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsNotEmpty({ message: 'User ID is required' })
  user_id: string;

  @IsNotEmpty({ message: 'Component is required' })
  component: string;

  @IsNotEmpty({ message: 'Type is required' })
  type: string;
}
