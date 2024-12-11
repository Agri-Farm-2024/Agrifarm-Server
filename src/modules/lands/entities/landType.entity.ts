import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Land } from './land.entity';
import { Plant } from 'src/modules/plants/entities/plant.entity';
import { LandTypeStatus } from '../types/landType-status.enum';

@Entity('lands_type')
export class LandType extends AbstractEntity {
  constructor(land: Partial<LandType>) {
    super();
    Object.assign(this, land);
  }

  @PrimaryGeneratedColumn('uuid', { name: 'land_type_id' })
  land_type_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LandTypeStatus,
    default: LandTypeStatus.active,
  })
  status: LandTypeStatus;

  // Relations

  @OneToMany(() => Land, (land) => land.land_type)
  lands: Land[];

  @OneToMany(() => Plant, (plant) => plant.land_type)
  plants: Plant[];
}
