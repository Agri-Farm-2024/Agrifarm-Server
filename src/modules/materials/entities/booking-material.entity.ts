import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingMaterialStatus } from '../types/booking-material-status.enum';
import { User } from 'src/modules/users/entities/user.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { BookingMaterialDetail } from './booking-material-detail.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

@Entity('booking_material')
export class BookingMaterial extends AbstractEntity {
  constructor(bookingMaterial: Partial<BookingMaterial>) {
    super();
    Object.assign(this, bookingMaterial);
  }

  @PrimaryGeneratedColumn('uuid')
  booking_material_id: string;

  @Column('uuid')
  staff_id: string;

  @Column('uuid')
  landrenter_id: string;

  @Column('uuid')
  booking_land_id: string;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column({ nullable: true })
  contract_image: string;

  @Column({ nullable: true })
  reason_for_cancel: string;

  @Column({ nullable: true })
  signed_at: Date;

  @Column({
    type: 'enum',
    enum: BookingMaterialStatus,
    default: BookingMaterialStatus.pending_payment,
  })
  status: BookingMaterialStatus;
  // Relations
  @ManyToOne(() => User, (user) => user.staff_booking_materials)
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToOne(() => User, (user) => user.landrenter_booking_materials)
  @JoinColumn({ name: 'landrenter_id' })
  landrenter: User;

  @ManyToOne(() => BookingLand, (bookingLand) => bookingLand.booking_materials)
  @JoinColumn({ name: 'booking_land_id' })
  booking_land: BookingLand;

  @OneToMany(
    () => BookingMaterialDetail,
    (bookingMaterialDetail) => bookingMaterialDetail.bookingMaterial,
  )
  booking_material_detail: BookingMaterialDetail[];

  @OneToOne(() => Transaction, (transaction) => transaction.booking_material)
  transaction: Transaction;

  @OneToMany(() => Request, (request) => request.booking_material)
  requests: Request[];
}
