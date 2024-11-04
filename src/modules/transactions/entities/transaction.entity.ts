import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionType } from '../types/transaction-type.enum';
import { TransactionStatus } from '../types/transaction-status.enum';
@Entity('transactions')
export class Transaction extends AbstractEntity {
  constructor(transaction: Partial<Transaction>) {
    super();
    Object.assign(this, transaction);
  }

  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column('uuid', { nullable: true })
  booking_id: string;

  @Column('uuid', { nullable: true })
  extend_id: string;

  @Column('uuid', { nullable: true })
  service_specific_id: string;

  @Column({ unique: true })
  transaction_code: string;

  @Column()
  expired_at: Date;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.order,
  })
  type: TransactionType;

  @Column({ type: 'int' })
  total_price: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;
  // Relations
  @OneToOne(() => Order, (order) => order.transaction)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
