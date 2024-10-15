import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ServiceSpecific } from './serviceSpecific.entity';

@Entity('services')
export class Service extends AbstractEntity {
  constructor(service: Partial<Service>) {
    super();
    Object.assign(this, service);
  }

  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  process_of_plant: Boolean;
  @Column()
  material: Boolean;
  @Column()
  purchase: Boolean;

  @Column()
  price: number;

  @OneToMany(
    () => ServiceSpecific,
    (serviceSpecific) => serviceSpecific.service_id,
  )
  service_specific: ServiceSpecific[];
}
