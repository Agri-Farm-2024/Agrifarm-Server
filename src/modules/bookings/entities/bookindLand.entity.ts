import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { Land } from 'src/modules/lands/entities/land.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingStatus } from '../types/booking-status.enum';

@Entity('bookings_land')
export class BookindLand extends AbstractEntity {
  constructor(bookindLand: Partial<BookindLand>) {
    super();
    Object.assign(this, bookindLand);
  }

  @PrimaryGeneratedColumn('uuid')
  booking_id: string;

  @Column('uuid')
  landrenter_id: string;

  @Column('uuid')
  staff_id: string;

  @Column('uuid')
  land_id: string;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column({
    type: 'int',
    default: 1,
  })
  total_month: number;

  @Column()
  price_per_month: number;

  @Column()
  price_deposit: number;

  @Column({ type: 'bigint' })
  total_price: number;

  @Column()
  purpose_rental: string;

  @Column({ default: false })
  is_schedule: boolean;

  @Column({
    nullable: true,
  })
  contract_image: string;

  @Column({
    nullable: true,
  })
  reason_for_reject: string;

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

  @ManyToOne(() => User, (user) => user.booking_by_lanrenter, {
    nullable: true,
  })
  @JoinColumn({ name: 'landrenter_id' })
  land_renter: User;

  @ManyToOne(() => User, (user) => user.booking_staff_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToOne(() => Land, (land) => land.booking_land, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_id' })
  land: Land;
}
