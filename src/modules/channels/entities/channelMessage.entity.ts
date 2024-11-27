import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelMessageType } from '../types/channel-message-type.enum';
import { Channel } from './channel.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('channels_message')
export class ChannelMessage extends AbstractEntity {
  constructor(partial: Partial<ChannelMessage>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  channel_message: string;

  @Column('uuid')
  message_from_id: string;

  @Column('uuid')
  message_to_id: string;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: ChannelMessageType,
    default: ChannelMessageType.text,
  })
  message_type: ChannelMessageType;
  // Relation
  @ManyToOne(() => Channel, (channel) => channel.messages)
  @JoinColumn({ name: 'message_to_id' })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.messages_sended)
  @JoinColumn({ name: 'message_from_id' })
  message_from: User;
}
