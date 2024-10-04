import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PlantSeason } from './plantSeason';

@Entity('plants')
export class Plant extends AbstractEntity {
  constructor(plant: Partial<Plant>) {
    super();
    Object.assign(this, plant);
  }

  @Column()
  name: string;

  @OneToMany(() => PlantSeason, (plantSeason) => plantSeason.plant)
  plants_season: PlantSeason[];
}
