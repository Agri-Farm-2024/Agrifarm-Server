import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plant } from 'src/modules/plants/entities/plant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PlantsModule } from 'src/modules/plants/plants.module';
import { ServicePackage } from './servicePackage.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { ServiceSpecificStatus } from '../types/service-specific-status.enum';

@Entity('services_specific')
export class ServiceSpecific extends AbstractEntity {
  constructor(serviceSpecific: Partial<ServiceSpecific>) {
    super();
    Object.assign(this, serviceSpecific);
  }

  @PrimaryGeneratedColumn('uuid')
  service_specific_id: string;

  @Column('uuid')
  landrenter_id: string;

  @Column()
  acreage_land: number;

  @Column('uuid')
  plant_id: string;

  @Column('uuid')
  service_package_id: string;

  @Column()
  price_process: number;

  @Column()
  total_price: number;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column({
    type: 'enum',
    enum: ServiceSpecificStatus,
    default: ServiceSpecificStatus.pending_payment,
  })
  status: ServiceSpecificStatus;

  @ManyToOne(() => ServicePackage, (service) => service.service_specific)
  @JoinColumn({ name: 'service_id' })
  service_package: ServicePackage;

  @ManyToOne(() => User, (user) => user.service_specific)
  @JoinColumn({ name: 'Landrenter_id' })
  land_renter: ServiceSpecific;

  @ManyToOne(() => Plant, (plant) => plant.service_specific)
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  @OneToMany(
    () => OrderDetail,
    (orderDetail) => orderDetail.service_specific_id,
  )
  service_specific_order_details_id: OrderDetail[];
}
