import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendStatus } from '../types/extend-status.enum';

@Entity('extends')
export class Extend extends AbstractEntity {
  constructor(extend: Partial<Extend>) {
    super();
    Object.assign(this, extend);
  }

  @PrimaryGeneratedColumn('uuid')
  extend_id: string;

  @Column('uuid')
  booking_land_id: string;

  @Column({ nullable: true })
  total_month: number;

  @Column({ nullable: true })
  time_start: Date;

  @Column()
  price_per_month: number;

  @Column({ nullable: true })
  reason_for_reject: string;

  @Column({ nullable: true })
  contract_image: string;

  @Column({
    type: 'enum',
    enum: ExtendStatus,
    default: ExtendStatus.pending_contract,
  })
  status: ExtendStatus;

  // relation

  @ManyToOne(() => BookingLand, (bookingLand) => bookingLand.extends)
  @JoinColumn({ name: 'booking_land_id' })
  booking_land: BookingLand;

  @OneToMany(() => Transaction, (transaction) => transaction.extend)
  transactions: Transaction[];
}
