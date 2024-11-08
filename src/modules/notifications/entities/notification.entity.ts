import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '../types/notification-type.enum';

@Entity('notifications')
export class Notification extends AbstractEntity {
  constructor(notification: Partial<Notification>) {
    super();
    Object.assign(this, notification);
  }

  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('uuid')
  component_id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.task,
  })
  type: NotificationType;

  @Column({ default: false })
  is_seen: boolean;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
