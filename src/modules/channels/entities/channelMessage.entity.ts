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
import { ChannelMessageType } from '../types/channel-message-type.enum';

@Entity('channels_message')
export class ChannelMessage extends AbstractEntity {
  constructor(partial: Partial<ChannelMessage>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  channel_message: string;

  @Column('uuid')
  message_form_id: string;

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
}
