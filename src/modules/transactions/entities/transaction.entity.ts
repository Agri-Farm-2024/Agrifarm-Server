import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { TransactionStatus } from 'src/utils/status/transaction-status.enum';
import { PaymentMethod } from 'src/utils/types/transaction-type.enum';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
@Entity('transactions')
export class Transaction extends AbstractEntity {
  constructor(transaction: Partial<Transaction>) {
    super();
    Object.assign(this, transaction);
  }

  @Column()
  transaction_code: string;
  @OneToOne(() => Order, (order) => order.transaction_id)
  @JoinColumn({ name: 'order_id' })
  order_id: Order;
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.bank,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;
}
