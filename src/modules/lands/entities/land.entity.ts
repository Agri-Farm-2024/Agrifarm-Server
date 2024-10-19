import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { LandSubDescription } from './landSubDescription.entity';
import { LandURL } from './landURL.entity';
import { LandStatus } from '../types/land-status.enum';

@Entity('lands')
export class Land extends AbstractEntity {
  constructor(land: Partial<Land>) {
    super();
    Object.assign(this, land);
  }

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  description: string;

  @Column('decimal', { scale: 2 })
  acreage_land: number;

  @Column('uuid', { name: 'staff_id', nullable: true })
  staff_id: string;

  @Column('decimal', { scale: 2 })
  price_booking_per_month: number;

  @Column({
    type: 'enum',
    enum: LandStatus,
    default: LandStatus.free,
  })
  status: LandStatus;

  @OneToMany(
    () => LandSubDescription,
    (landSubDescription) => landSubDescription.land,
  )
  sub_description: LandSubDescription[];

  @OneToMany(() => LandURL, (landURL) => landURL.land)
  url: LandURL[];

  @ManyToOne(() => User, (user) => user.land_by_staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @OneToMany(() => BookindLand, (bookindLand) => bookindLand.land_id)
  booking_land: BookindLand[];
}
