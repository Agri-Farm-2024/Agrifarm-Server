import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PlantSeason } from './plantSeason';
import { StatusPlant } from '../types/plant-status.enum';
import { ProcessStandard } from 'src/modules/processes/entities/standards/processStandard.entity';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';

@Entity('plants')
export class Plant extends AbstractEntity {
  constructor(plant: Partial<Plant>) {
    super();
    Object.assign(this, plant);
  }

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

  @OneToMany(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.plant)
  service_specific: ServiceSpecific[];

  @OneToMany(
    () => ProcessStandard,
    (processStandard) => processStandard.plant_process_id,
  )
  process_standard: ProcessStandard[];
}
