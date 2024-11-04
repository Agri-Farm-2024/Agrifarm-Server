import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { ProcessSpecific } from './processSpecific.entity';
import { ProcessSpecificStageContent } from './processSpecificStageContent.entity';
import { ProcessSpecificStageMaterial } from './processSpecificStageMaterial.entity';

@Entity('processes_technical_specific_stage')
export class ProcessSpecificStage extends AbstractEntity {
  constructor(processSpecificStage: Partial<ProcessSpecificStage>) {
    super();
    Object.assign(this, processSpecificStage);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_specific_stage_id: string;

  @Column('uuid')
  process_technical_specific_id: string;

  @Column()
  title: string;

  @Column('int')
  numberic_order: number;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @ManyToOne(
    () => ProcessSpecific,
    (processSpecific) => processSpecific.process_technical_specific_stage,
  )
  @JoinColumn({ name: 'process_technical_specific_id' })
  process_technical_specific: ProcessSpecific;

  @OneToMany(
    () => ProcessSpecificStageContent,
    (processSpecificStageContent) =>
      processSpecificStageContent.process_technical_specific_stage,
  )
  process_technical_specific_stage_content: ProcessSpecificStageContent[];

  @OneToMany(
    () => ProcessSpecificStageMaterial,
    (processSpecificStageMaterial) =>
      processSpecificStageMaterial.process_technical_specific_stage,
  )
  process_technical_specific_stage_material: ProcessSpecificStageMaterial[];
}
