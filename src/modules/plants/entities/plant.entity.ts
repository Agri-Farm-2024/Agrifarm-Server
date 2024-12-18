import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlantSeason } from './plantSeason.entity';
import { StatusPlant } from '../types/plant-status.enum';
import { LandType } from 'src/modules/lands/entities/landType.entity';
@Entity('plants')
export class Plant extends AbstractEntity {
  constructor(plant: Partial<Plant>) {
    super();
    Object.assign(this, plant);
  }

  @PrimaryGeneratedColumn('uuid')
  plant_id: string;

  @Column('uuid', { nullable: true })
  land_type_id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: StatusPlant,
    default: StatusPlant.active,
  })
  status: StatusPlant;

  @OneToMany(() => PlantSeason, (plantSeason) => plantSeason.plant)
  plants_season: PlantSeason[];

  @ManyToOne(() => LandType, (landType) => landType.lands)
  @JoinColumn({ name: 'land_type_id' })
  land_type: LandType;
}
