import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { TransactionStatus } from 'src/utils/status/transaction-status.enum';
import { PaymentMethod } from 'src/utils/types/transaction-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @Column()
  transaction_code: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.bank,
  })
  payment_method: PaymentMethod;

  @Column()
  expired_at: Date;

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
