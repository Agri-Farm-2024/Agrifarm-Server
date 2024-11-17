import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Land } from 'src/modules/lands/entities/land.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { DinaryStage } from 'src/modules/dinaries/entities/dinaryStage.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { UserStatus } from '../types/user-status.enum';
import { UserRole } from '../types/user-role.enum';
import { ProcessStandard } from 'src/modules/processes/entities/standards/processStandard.entity';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { BookingMaterial } from 'src/modules/materials/entities/booking-material.entity';
import { ProcessSpecific } from 'src/modules/processes/entities/specifics/processSpecific.entity';

@Entity('users') // Maps this class to the 'users' table in the database
export class User extends AbstractEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.pending,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.land_renter,
  })
  role: UserRole;
  // Relations
  @OneToMany(() => Land, (land) => land.staff)
  land_by_staff: Land[];

  @OneToMany(() => Request, (request) => request.sender)
  request: Request[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Task, (task) => task.assign_by)
  task_assigned_by: Task[];

  @OneToMany(() => Task, (task) => task.assign_to)
  task_assigned_to: Task[];

  @OneToMany(
    () => ServiceSpecific,
    (serviceSpecific) => serviceSpecific.land_renter,
  )
  service_specific: ServiceSpecific[];

  @OneToMany(() => BookingLand, (bookingLand) => bookingLand.land_renter)
  booking_by_lanrenter: BookingLand[];

  @OneToMany(() => BookingLand, (bookingLand) => bookingLand.staff_id)
  booking_staff_id: BookingLand[];

  @OneToMany(() => Extend, (extend) => extend.land_renter)
  extend_landrenter_id: Extend[];

  @OneToMany(() => Order, (order) => order.land_renter)
  orders_landrenter_id: Order[];

  @OneToMany(() => ProcessStandard, (processStandard) => processStandard.expert)
  process_standard_by_expert: ProcessStandard[];

  @OneToMany(() => Report, (report) => report.report_from)
  reports: Report[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => BookingMaterial, (bookingMaterial) => bookingMaterial.staff)
  staff_booking_materials: BookingMaterial[];

  @OneToMany(
    () => BookingMaterial,
    (bookingMaterial) => bookingMaterial.landrenter,
  )
  landrenter_booking_materials: BookingMaterial[];

  @OneToMany(() => ProcessSpecific, (processSpecific) => processSpecific.expert)
  expert_process_technical_specific: ProcessSpecific[];
}
