import { AbstractEntity } from "src/database/postgres/entities/abstract.entity";
import { Entity, Column, ManyToOne, JoinColumn, } from "typeorm";

@Entity('services')
export class Service extends AbstractEntity {
  constructor(service: Partial<Service>) {
    super();
    Object.assign(this, service);
  }

  @Column()
  name: string;

  @Column()
  price: number;

  
}
