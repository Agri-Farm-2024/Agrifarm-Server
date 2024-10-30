import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Land } from './land.entity';

@Entity('lands_type')
export class LandType extends AbstractEntity {
  constructor(land: Partial<LandType>) {
    super();
    Object.assign(this, land);
  }

  @PrimaryGeneratedColumn('uuid')
  land_type_id: string;

  @Column()
  name: string;

  @Column()
  description: String;

  @OneToMany(() => Land, (land) => land.land_type)
  lands: Land[];
}
