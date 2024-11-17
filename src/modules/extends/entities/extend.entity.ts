import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  @Column()
  booking_id: string;

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
  // relation
  @OneToOne(() => BookingLand, (bookingLand) => bookingLand.extend_id)
  @JoinColumn({ name: 'booking_id' })
  booking_land_id: BookingLand;

  @OneToMany(() => Transaction, (transaction) => transaction.extend)
  transactions: Transaction[];
}
