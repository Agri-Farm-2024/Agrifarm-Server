import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { UserRole } from 'src/utils/roles/user-role.enum';
import { Land } from 'src/modules/lands/entities/land.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { DinaryStage } from 'src/modules/dinaries/entities/dinaryStage.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { UserStatus } from 'src/utils/status/user-status.enum';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { Dinary } from 'src/modules/dinaries/entities/dinary.entity';
import { ServiceSpecific } from 'src/modules/services/entities/serviceSpecific.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { Extend } from 'src/modules/extends/entities/extend.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('users') // Maps this class to the 'users' table in the database
export class User extends AbstractEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

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

  @OneToMany(() => Land, (land) => land.staff)
  land_by_staff: Land[];

  @OneToMany(() => Land, (land) => land.land_renter)
  land_by_land_renter: Land[];

  @OneToMany(() => Request, (request) => request.land_renter)
  request_by_land_renter: Request[];

  @OneToMany(() => Dinary, (dinary) => dinary.land_renter_id)
  dinary_by_land_renter: DinaryStage[];

  @OneToMany(() => DinaryStage, (dinaryStage) => dinaryStage.writter)
  dinary_stage_by_writer: DinaryStage[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Task, (task) => task.assigned_by_id)
  task_assigned_by: Task[];

  @OneToMany(() => Task, (task) => task.assigned_to_id)
  task_assigned_to: Task[];

  @OneToMany(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.land_renter)
  service_specific: ServiceSpecific[];

  @OneToMany(() => BookindLand, (bookindLand) => bookindLand.land_renter_id)
  booking_landrenter_id: BookindLand[];

  @OneToMany(() => BookindLand, (bookindLand) => bookindLand.staff_id)
  booking_staff_id: BookindLand[];

  @OneToMany(()=> Extend, (extend) => extend.land_renter)
  extend_landrenter_id: Extend[];

  @OneToMany(() => Order, (order) => order.land_renter)
  orders_landrenter_id: Order[];
}
