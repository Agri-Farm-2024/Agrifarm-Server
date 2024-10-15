import e from 'express';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { OrderDetail } from './orderDetail.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';

@Entity('orders')
export class Order extends AbstractEntity {
  constructor(order: Partial<Order>) {
    super();
    Object.assign(this, order);
  }

  @ManyToOne(() => User, (user) => user.orders_landrenter_id)
  @JoinColumn({ name: 'landrenter_id' })
  land_renter: User;
  @Column()
  tax: number;
  
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  order_details_id: OrderDetail[];

  @OneToOne(() => Transaction, (transaction) => transaction.order_id)
    transaction_id: Transaction;
}
