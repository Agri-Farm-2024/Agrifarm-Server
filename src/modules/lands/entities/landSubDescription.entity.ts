import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Land } from './land.entity';

@Entity('lands_sub_description')
export class LandSubDescription extends AbstractEntity {
  constructor(land: Partial<LandSubDescription>) {
    super();
    Object.assign(this, land);
  }

  @PrimaryGeneratedColumn('uuid')
  land_sub_description_id: string;

  @Column('uuid', { name: 'land_id' })
  land_id: string;

  @Column()
  sub_title: string;

  @Column()
  sub_description: string;

  @ManyToOne(() => Land, (land) => land.sub_description, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_id' })
  land: Land;
}
