import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { NotificationType } from 'src/utils/notification-type.enum';
import { Entity, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';

@Entity('notifications')
export class Notification extends AbstractEntity {
  constructor(notification: Partial<Notification>) {
    super();
    Object.assign(this, notification);
  }

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  component_id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.task,
  })
  type: NotificationType;

  @Column()
  is_seen: boolean;
}
