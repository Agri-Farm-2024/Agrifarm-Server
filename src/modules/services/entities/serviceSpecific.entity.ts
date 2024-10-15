import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Plant } from 'src/modules/plants/entities/plant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PlantsModule } from 'src/modules/plants/plants.module';
import { Service } from './service.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';

@Entity('services_specific')
export class ServiceSpecific extends AbstractEntity {
  constructor(serviceSpecific: Partial<ServiceSpecific>) {
    super();
    Object.assign(this, serviceSpecific);
  }

  @Column()
  acreage_land: number;

  @Column()
  price_process: number;

  @Column()
  total_price: number;

  @Column()
  type: 'enum';
  enum: ['pending_payment', 'used', 'expired'];
    default: 'pending_payment';

  @ManyToOne(() => User, (user) => user.service_specific)
  @JoinColumn({ name: 'Landrenter_id' })
  land_renter: ServiceSpecific;

  @ManyToOne(() => Plant, (plant) => plant.service_specific)
  @JoinColumn({ name: 'plant_id' })
  plantService_id: Plant;

  @ManyToOne(() => Service, (service) => service.service_specific)
  @JoinColumn({ name: 'service_id' })
  service_id: Service;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.service_specific_id)
  service_specific_order_details_id: OrderDetail[];
}
