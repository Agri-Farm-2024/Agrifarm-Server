import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LandStatus } from 'src/utils/status/land-status.enum';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('lands')
export class Land extends AbstractEntity {
  constructor(land: Partial<Land>) {
    super();
    Object.assign(this, land);
  }

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 6, scale: 2 })
  acreage_land: number;

  @Column('uuid', { name: 'staff_id', nullable: true })
  staff_id: string;

  @ManyToOne(() => User, (user) => user.land_by_staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @Column('decimal', { precision: 10, scale: 2 })
  price_booking_per_month: number;

  @OneToMany(() => BookindLand, (bookindLand) => bookindLand.land_id)
  booking_land_id: BookindLand[];

  @Column({
    type: 'enum',
    enum: LandStatus,
    default: LandStatus.free,
  })
  status: LandStatus;
}
