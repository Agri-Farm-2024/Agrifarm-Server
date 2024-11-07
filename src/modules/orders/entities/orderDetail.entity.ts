import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Material } from 'src/modules/materials/entities/material.entity';
import { TypeOrderDetail } from 'src/utils/types/orderDetail-type.enum';
@Entity('order_details')
export class OrderDetail extends AbstractEntity {
  constructor(orderDetail: Partial<OrderDetail>) {
    super();
    Object.assign(this, orderDetail);
  }

  @PrimaryGeneratedColumn('uuid')
  order_detail_id: string;

  @Column('uuid' , {name: 'order_id'})
  order_id: string;

  @Column('uuid' , {name: 'material_id'})
  material_id: string;

  @ManyToOne(() => Order, (order) => order.order_details_id)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Material, (material) => material.material_order_details_id)
  @JoinColumn({ name: 'material_id' })
  material_oder: Material;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column()
  total_price: number;
}
