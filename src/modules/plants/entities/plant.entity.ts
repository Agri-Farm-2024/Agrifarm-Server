import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PlantSeason } from './plantSeason';
import { ServiceSpecific } from 'src/modules/services/entities/serviceSpecific.entity';

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

  @OneToMany(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.plantService_id)
  service_specific: ServiceSpecific[];
}
