import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestSupportType } from '../types/request-support-type.enum';
import { RequestStatus } from 'src/utils/status/request-status.enum';
import { RequestType } from '../types/request-type.enum';
import { Task } from 'src/modules/tasks/entities/task.entity';

@Entity('requests')
export class Request extends AbstractEntity {
  constructor(request: Partial<Request>) {
    super();
    Object.assign(this, request);
  }

  @PrimaryGeneratedColumn('uuid')
  request_id: string;

  @Column({ nullable: true })
  guest_full_name: string;

  @Column({ nullable: true })
  guest_email: string;

  @Column({ nullable: true })
  guest_phone: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: 'timestamptz' })
  time_start: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  time_end: Date;

  @Column({ nullable: true, type: 'uuid' })
  sender_id: string;

  @Column({
    default: RequestSupportType.direct,
    type: 'enum',
    enum: RequestSupportType,
  })
  support_type: RequestSupportType;

  @Column({ default: RequestType.view_land, type: 'enum', enum: RequestType })
  type: RequestType;

  @Column({ default: RequestStatus.pending, type: 'enum', enum: RequestStatus })
  status: RequestStatus;

  @ManyToOne(() => User, (user) => user.request, {
    nullable: true,
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToOne(() => Task, (task) => task.request)
  task: Task;
}
