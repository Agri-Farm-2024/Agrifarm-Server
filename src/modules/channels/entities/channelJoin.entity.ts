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

@Entity('channels_join')
export class ChannelJoin extends AbstractEntity {
  constructor(partial: Partial<ChannelJoin>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  channel_join_id: string;

  @Column('uuid')
  user_join_id: string;
}
