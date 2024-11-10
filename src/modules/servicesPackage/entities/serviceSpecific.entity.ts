import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { ServicePackage } from './servicePackage.entity';
import { ServiceSpecificStatus } from '../types/service-specific-status.enum';
import { PlantSeason } from 'src/modules/plants/entities/plantSeason.entity';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';

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

  @Column('uuid')
  plant_season_id: string;

  @Column('uuid')
  booking_id: string;

  @Column('uuid')
  service_package_id: string;

  @Column()
  acreage_land: number;

  @Column()
  price_process: number;

  @Column()
  price_package: number;

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
  // Relation
  @ManyToOne(() => ServicePackage, (service) => service.service_specific)
  @JoinColumn({ name: 'service_package_id' })
  service_package: ServicePackage;

  @ManyToOne(() => User, (user) => user.service_specific)
  @JoinColumn({ name: 'landrenter_id' })
  land_renter: ServiceSpecific;

  @ManyToOne(() => PlantSeason, (plantSeason) => plantSeason.service_specific)
  @JoinColumn({ name: 'plant_season_id' })
  plant_season: PlantSeason;

  @ManyToOne(() => BookingLand, (booking) => booking.service_specific)
  @JoinColumn({ name: 'booking_id' })
  booking_land: BookingLand;

  @OneToOne(() => Transaction, (transaction) => transaction.service_specific)
  transaction: Transaction;
}
