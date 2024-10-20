import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Order } from './order.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { Material } from 'src/modules/materials/entities/material.entity';
import { TypeOrderDetail } from 'src/utils/types/orderDetail-type.enum';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
@Entity('order_details')
export class OrderDetail extends AbstractEntity {
  constructor(orderDetail: Partial<OrderDetail>) {
    super();
    Object.assign(this, orderDetail);
  }

  @ManyToOne(() => Order, (order) => order.order_details_id)
  @JoinColumn({ name: 'order_id' })
  order: Order;
  @OneToOne(
    () => BookindLand,
    (bookingLand) => bookingLand.booking_order_detail,
  )
  @JoinColumn({ name: 'booking_id' })
  booking_id: BookindLand;

  @ManyToOne(() => Material, (material) => material.material_order_details_id)
  @JoinColumn({ name: 'material_id' })
  material_id: Material;
  @ManyToOne(
    () => ServiceSpecific,
    (serviceSpecific) => serviceSpecific.service_specific_order_details_id,
  )
  @JoinColumn({ name: 'service_specific_id' })
  service_specific_id: ServiceSpecific;
  @Column()
  quantity: number;
  default: 1;
  @Column()
  total_price: number;
  @Column({
    type: 'enum',
    enum: TypeOrderDetail,
    default: TypeOrderDetail.booking,
  })
  type: TypeOrderDetail;
}
