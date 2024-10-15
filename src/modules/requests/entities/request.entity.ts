import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { RequestStatus } from 'src/utils/status/request-status.enum';
import { RequestSupportType } from 'src/utils/types/request-support-type.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('requests')
export class Request extends AbstractEntity {
  constructor(request: Partial<Request>) {
    super();
    Object.assign(this, request);
  }

  @Column({ nullable: true })
  guest_name: string;

  @Column({ nullable: true })
  guest_email: string;

  @Column({ nullable: true })
  guest_phone: string;

  @Column({ nullable: true, type: 'timestamptz' })
  time_start: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  time_end: Date;

  @ManyToOne(() => User, (user) => user.request, {
    nullable: true,
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({
    default: RequestSupportType.direct,
    type: 'enum',
    enum: RequestSupportType,
  })
  support_type: RequestSupportType;

  @Column({ default: RequestStatus.pending, type: 'enum', enum: RequestStatus })
  status: RequestStatus;
}
