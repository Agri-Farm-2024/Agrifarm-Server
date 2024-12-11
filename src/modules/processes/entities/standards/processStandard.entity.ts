import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProcessStandardStage } from './processStandardStage.entity';
import { PlantSeason } from 'src/modules/plants/entities/plantSeason.entity';
import { ProcessTechnicalStandardStatus } from '../../types/status-processStandard.enum';
import { ProcessSpecific } from '../specifics/processSpecific.entity';
@Entity('processes_technical_standard')
export class ProcessStandard extends AbstractEntity {
  constructor(processStandard: Partial<ProcessStandard>) {
    super();
    Object.assign(this, processStandard);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_standard_id: string;

  @Column('uuid')
  plant_season_id: string;

  @Column('uuid', { nullable: true })
  expert_id: string;

  @Column()
  name: string;

  @Column(null, { nullable: true })
  reason_of_reject: string;

  @Column({
    type: 'enum',
    enum: ProcessTechnicalStandardStatus,
    default: ProcessTechnicalStandardStatus.pending,
  })
  status: ProcessTechnicalStandardStatus;
  // Relations
  @OneToOne(() => PlantSeason, (plantSeason) => plantSeason.process_technical_standard)
  @JoinColumn({ name: 'plant_season_id' })
  plant_season: PlantSeason;

  @ManyToOne(() => User, (user) => user.process_standard_by_expert)
  @JoinColumn({ name: 'expert_id' })
  expert: User;

  @OneToMany(
    () => ProcessStandardStage,
    (processStandardStage) => processStandardStage.process_standard_stage,
  )
  process_standard_stage: ProcessStandardStage[];

  @OneToMany(() => ProcessSpecific, (processSpecific) => processSpecific.process_technical_standard)
  process_technical_standard: ProcessSpecific[];
}
