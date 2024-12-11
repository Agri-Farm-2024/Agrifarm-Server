import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LandURL } from './landURL.entity';
import { LandStatus } from '../types/land-status.enum';
import { LandType } from './landType.entity';

@Entity('lands')
export class Land extends AbstractEntity {
  constructor(land: Partial<Land>) {
    super();
    Object.assign(this, land);
  }

  @PrimaryGeneratedColumn('uuid')
  land_id: string;

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

  @Column('uuid', { name: 'land_type_id', nullable: true })
  land_type_id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  price_booking_per_month: number;

  @Column({
    type: 'enum',
    enum: LandStatus,
    default: LandStatus.free,
  })
  status: LandStatus;

  // Relationss

  @OneToMany(() => LandURL, (landURL) => landURL.land)
  url: LandURL[];

  @ManyToOne(() => User, (user) => user.land_by_staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @OneToMany(() => BookingLand, (bookingLand) => bookingLand.land)
  booking_land: BookingLand[];

  @ManyToOne(() => LandType, (landType) => landType.lands)
  @JoinColumn({ name: 'land_type_id' })
  land_type: LandType;
}
