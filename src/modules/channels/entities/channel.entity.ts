import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelStatus } from '../types/channel-status.enum';
import { ChannelJoin } from './channelJoin.entity';
import { ChannelMessage } from './channelMessage.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

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
    nullable: true,
  })
  expired_at: Date;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.active,
  })
  status: ChannelStatus;
  // Relation
  @OneToMany(() => ChannelJoin, (channelJoin) => channelJoin.channel)
  joins: ChannelJoin[];

  @OneToMany(() => ChannelMessage, (channelMessage) => channelMessage.channel)
  messages: ChannelMessage[];

  @OneToOne(() => Request, (request) => request.channel)
  @JoinColumn({ name: 'request_id' })
  request: Request;
}
