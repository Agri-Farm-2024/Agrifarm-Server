import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { Land } from 'src/modules/lands/entities/land.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookingStatus } from '../types/booking-status.enum';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
import { BookingPaymentFrequency } from '../types/booking-payment.enum';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { BookingMaterial } from 'src/modules/materials/entities/booking-material.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

@Entity('bookings_land')
export class BookingLand extends AbstractEntity {
  constructor(bookindLand: Partial<BookingLand>) {
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

  @Column({
    type: 'int',
    default: 1,
  })
  price_per_month: number;

  @Column({
    type: 'int',
    default: 0,
  })
  price_deposit: number;

  @Column()
  purpose_rental: string;

  @Column({
    nullable: true,
  })
  contract_image: string;

  @Column({
    nullable: true,
  })
  reason_for_reject: string;

  @Column({
    nullable: true,
  })
  reason_for_cancel: string;

  @Column({ nullable: true, type: 'float' })
  quality_report: number;

  @Column({ nullable: true })
  expired_schedule_at: Date;

  @Column({ nullable: true })
  signed_at: Date;

  @Column({
    type: 'enum',
    enum: BookingPaymentFrequency,
    default: BookingPaymentFrequency.single,
  })
  payment_frequency: BookingPaymentFrequency;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.pending,
  })
  status: BookingStatus;

  // Relations

  @OneToMany(() => Extend, (extend) => extend.booking_land)
  extends: Extend[];

  @ManyToOne(() => User, (user) => user.booking_by_lanrenter)
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

  @OneToMany(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.booking_land)
  service_specific: ServiceSpecific[];

  @OneToMany(() => Transaction, (transaction) => transaction.booking_land)
  transactions: Transaction[];

  @OneToMany(() => BookingMaterial, (bookingMaterial) => bookingMaterial.booking_land)
  booking_materials: BookingMaterial[];

  @OneToMany(() => Request, (request) => request.booking_land)
  requests: Request[];
}
