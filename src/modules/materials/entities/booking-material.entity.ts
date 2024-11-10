import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingMaterialStatus } from '../types/booking-material-status.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { BookingMaterialDetail } from './booking-material-detail.entity';

@Entity('booking_material')
export class BookingMaterial extends AbstractEntity {
  constructor(bookingMaterial: Partial<BookingMaterial>) {
    super();
    Object.assign(this, bookingMaterial);
  }

  @PrimaryGeneratedColumn('uuid')
  booking_material_id: string;

  @Column('uuid', { name: 'staff_id' })
  staff_id: string;

  @Column('uuid', { name: 'landrenter_id' })
  landrenter_id: string;

  @Column('uuid', { name: 'booking_id' })
  booking_id: string;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column({ nullable: true })
  quality_report: string;

  @Column({ nullable: true })
  contract_image: string;

  @Column({ nullable: true })
  reason_for_reject: string;

  @Column({ nullable: true })
  reason_for_cancel: string;

  @Column()
  is_schedule: boolean;

  @Column()
  expired_schedule_at: Date;

  @Column({ nullable: true })
  signed_at: Date;

  @Column({
    type: 'enum',
    enum: BookingMaterialStatus,
    default: BookingMaterialStatus.pending,
  })
  status: BookingMaterialStatus;

  @ManyToOne(() => User, (user) => user.staff_booking_materials)
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToOne(() => User, (user) => user.landrenter_booking_materials)
  @JoinColumn({ name: 'landrenter_id' })
  landrenter: User;

  @ManyToOne(
    () => BookingLand,
    (bookingLand) => bookingLand.land_booking_materials,
  )
  @JoinColumn({ name: 'booking_id' })
  booking: BookingLand;

  @OneToMany(
    () => BookingMaterialDetail,
    (bookingMaterialDetail) => bookingMaterialDetail.bookingMaterial,
  )
  booking_material_detail: BookingMaterialDetail[];
}
