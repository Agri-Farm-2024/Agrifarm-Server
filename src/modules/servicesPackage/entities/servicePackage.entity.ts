import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceSpecific } from './serviceSpecific.entity';

@Entity('services_package')
export class ServicePackage extends AbstractEntity {
  constructor(service: Partial<ServicePackage>) {
    super();
    Object.assign(this, service);
  }

  @PrimaryGeneratedColumn('uuid')
  service_package_id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  process_of_plant: boolean;

  @Column()
  material: boolean;

  @Column()
  purchase: boolean;

  @Column()
  price: number;

  @OneToMany(
    () => ServiceSpecific,
    (serviceSpecific) => serviceSpecific.service_package,
  )
  service_specific: ServiceSpecific[];
}