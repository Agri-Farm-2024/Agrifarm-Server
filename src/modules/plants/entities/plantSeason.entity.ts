import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plant } from './plant.entity';
import { PlantSeasonStatus } from '../types/plant-season-status.enum';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
import { ProcessStandard } from 'src/modules/processes/entities/standards/processStandard.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { PlantSeasonType } from '../types/plant-season-type.enum';

@Entity('plants_season')
export class PlantSeason extends AbstractEntity {
  constructor(plantSeason: Partial<PlantSeason>) {
    super();
    Object.assign(this, plantSeason);
  }

  @PrimaryGeneratedColumn('uuid')
  plant_season_id: string;

  @Column('uuid', { name: 'plant_id', nullable: true })
  plant_id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  month_start: number;

  @Column({
    type: 'int',
    default: 1,
  })
  total_month: number;

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

  @Column({
    type: 'enum',
    enum: PlantSeasonStatus,
    default: PlantSeasonStatus.active,
  })
  status: PlantSeasonStatus;

  // Relations

  @ManyToOne(() => Plant, (plant) => plant.plants_season, { nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  @OneToMany(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.plant_season)
  service_specific: ServiceSpecific[];

  @OneToOne(() => ProcessStandard, (processStandard) => processStandard.plant_season)
  process_technical_standard: ProcessStandard;

  @OneToMany(() => Request, (request) => request.plant_season)
  requests: Request[];
}
