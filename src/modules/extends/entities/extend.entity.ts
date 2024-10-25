import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('extends')
export class Extend extends AbstractEntity {
  constructor(extend: Partial<Extend>) {
    super();
    Object.assign(this, extend);
  }

  @PrimaryGeneratedColumn('uuid')
  extend_id: string;

  @ManyToOne(() => User, (user) => user.extend_landrenter_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_renter_id' })
  land_renter: User;

  @Column()
  total_month: number;

  @Column()
  price_per_month: number;

  @Column()
  total_price: number;

  @Column()
  reason_for_reject: string;

  @Column()
  contract_extend_image: string;

  @OneToOne(() => BookingLand, (bookingLand) => bookingLand.extend_id)
  @JoinColumn({ name: 'booking_id' })
  booking_land_id: BookingLand;
}
