import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from '../types/transaction-type.enum';
import { TransactionStatus } from '../types/transaction-status.enum';
import { TransactionPurpose } from '../types/transaction-purpose.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
@Entity('transactions')
export class Transaction extends AbstractEntity {
  constructor(transaction: Partial<Transaction>) {
    super();
    Object.assign(this, transaction);
  }

  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column('uuid', { nullable: true })
  booking_land_id: string;

  @Column('uuid', { nullable: true })
  booking_material_id: string;

  @Column('uuid', { nullable: true })
  extend_id: string;

  @Column('uuid', { nullable: true })
  service_specific_id: string;

  @Column({ unique: true })
  transaction_code: string;

  @Column({
    // default after 24 hours
    default: () => 'CURRENT_TIMESTAMP + INTERVAL 1 DAY',
  })
  expired_at: Date;

  @Column({
    type: 'enum',
    enum: TransactionPurpose,
    default: TransactionPurpose.order,
  })
  purpose: TransactionPurpose;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.payment,
  })
  type: TransactionType;

  @Column({ type: 'int' })
  total_price: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.approved,
  })
  status: TransactionStatus;
  // Relations
  @OneToOne(() => Order, (order) => order.transaction)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BookingLand, (bookingLand) => bookingLand.transactions)
  @JoinColumn({ name: 'booking_land_id' })
  booking_land: BookingLand;

  @ManyToOne(
    () => ServiceSpecific,
    (serviceSpecific) => serviceSpecific.transactions,
  )
  @JoinColumn({ name: 'service_specific_id' })
  service_specific: ServiceSpecific;

  // @ManyToOne(() => BookingLand, (bookingLand) => bookingLand.transactions)
  // @JoinColumn({ name: 'booking_land_id' })
  // booking_material: BookingLand;

  // @ManyToOne(() => Order, (bookingLand) => bookingLand.transactions)
  // @JoinColumn({ name: 'booking_land_id' })
  // order: BookingLand;

  @ManyToOne(() => Extend, (extend) => extend.transactions)
  @JoinColumn({ name: 'extend_id' })
  extend: Extend;
}
