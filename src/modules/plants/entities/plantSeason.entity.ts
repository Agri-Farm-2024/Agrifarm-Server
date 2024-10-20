import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Plant } from './plant.entity';
import { PlantSeasonType } from 'src/utils/types/plantSeason-type.enum';

@Entity('plants_season')
export class PlantSeason extends AbstractEntity {
  constructor(plantSeason: Partial<PlantSeason>) {
    super();
    Object.assign(this, plantSeason);
  }

  @Column('uuid', { name: 'plant_id', nullable: true })
  plant_id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  month_start: number;

  @Column('int')
  price_purchase_per_kg: number;

  @Column('int')
  price_process: number;

  @Column({
    type: 'enum',
    enum: PlantSeasonType,
    default: PlantSeasonType.in_season,
  })
  type: PlantSeasonType;

  @ManyToOne(() => Plant, (plant) => plant.plants_season, { nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;
}
