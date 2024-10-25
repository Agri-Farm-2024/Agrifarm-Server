import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlantSeason } from './plantSeason.entity';
import { StatusPlant } from '../types/plant-status.enum';
@Entity('plants')
export class Plant extends AbstractEntity {
  constructor(plant: Partial<Plant>) {
    super();
    Object.assign(this, plant);
  }

  @PrimaryGeneratedColumn('uuid')
  plant_id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: StatusPlant,
    default: StatusPlant.active,
  })
  status: StatusPlant;

  @OneToMany(() => PlantSeason, (plantSeason) => plantSeason.plant)
  plants_season: PlantSeason[];
}
