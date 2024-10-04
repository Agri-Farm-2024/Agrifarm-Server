import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Plant } from './plant.entity';
import { PlantSeasonType } from 'src/utils/roles/plantSeason-type.enum';

@Entity('plants_season')
export class PlantSeason extends AbstractEntity {
  constructor(plant: Partial<Plant>) {
    super();
    Object.assign(this, plant);
  }

  @Column()
  name: string;

  @ManyToOne(() => Plant, (plant) => plant.plants_season, { nullable: false })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  @Column('decimal', { precision: 10, scale: 2 })
  price_purchase_per_kg: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price_process: number;

  @Column({
    type: 'enum',
    enum: PlantSeasonType,
    default: PlantSeasonType.in_season,
  })
  type: PlantSeasonType;
}
