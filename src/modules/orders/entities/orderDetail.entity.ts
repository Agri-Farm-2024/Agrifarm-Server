import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Material } from 'src/modules/materials/entities/material.entity';
@Entity('order_details')
export class OrderDetail extends AbstractEntity {
  constructor(orderDetail: Partial<OrderDetail>) {
    super();
    Object.assign(this, orderDetail);
  }

  @PrimaryGeneratedColumn('uuid')
  order_detail_id: string;

  @Column('uuid', { name: 'order_id' })
  order_id: string;

  @Column('uuid', { name: 'material_id' })
  material_id: string;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column()
  price_per_iteam: number;

  // Relation
  @ManyToOne(() => Order, (order) => order.orders_detail)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Material, (material) => material.orders_detail)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
