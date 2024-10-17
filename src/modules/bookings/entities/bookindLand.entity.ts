import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { Land } from 'src/modules/lands/entities/land.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { BookingStatus } from 'src/utils/status/booking-status.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('bookings_land')
export class BookindLand extends AbstractEntity {
  constructor(bookindLand: Partial<BookindLand>) {
    super();
    Object.assign(this, bookindLand);
  }

  @ManyToOne(() => User, (user) => user.booking_landrenter_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'landrenter_id' })
  land_renter_id: User;

  @ManyToOne(() => User, (user) => user.booking_staff_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'staff_id' })
  staff_id: User;

  @ManyToOne(() => Land, (land) => land.booking_land, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_id' })
  land_id: Land;

  @Column()
  total_month: number;

  @Column()
  price_per_month: number;

  @Column()
  price_deposit: number;

  @Column()
  total_price: number;

  @Column()
  reason_for_reject: string;

  @Column()
  purpose_rental: string;

  @Column()
  contract_image: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.pending,
  })
  status: BookingStatus;

  @OneToOne(() => Extend, (extend) => extend.booking_land_id)
  extend_id: Extend;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.booking_id)
  booking_order_detail: OrderDetail;
}
