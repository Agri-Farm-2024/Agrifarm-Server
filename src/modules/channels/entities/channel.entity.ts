import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelStatus } from '../types/channel-status.enum';

@Entity('channels')
export class Channel extends AbstractEntity {
  constructor(partial: Partial<Channel>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  channel_id: string;

  @Column('uuid')
  request_id: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expired_at: Date;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.active,
  })
  status: ChannelStatus;
}
