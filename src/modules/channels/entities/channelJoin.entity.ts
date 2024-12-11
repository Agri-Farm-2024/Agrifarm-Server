import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from './channel.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('channels_join')
export class ChannelJoin extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  channel_join_id: string;

  @Column('uuid')
  channel_id: string;

  @Column('uuid')
  user_join_id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  join_at: Date;

  // Relation
  @ManyToOne(() => Channel, (channel) => channel.joins)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.channels_join)
  @JoinColumn({ name: 'user_join_id' })
  user: User;
}
