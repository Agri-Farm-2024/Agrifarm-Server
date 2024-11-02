import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProcessStandard } from './processStandard.entity';
import { ProcessStandardStageContent } from './processStandardStageContent.entity';
import { ProcessStandardStageMaterial } from './processStandardStageMaterial.entity';

@Entity('processes_technical_standard_stage')
export class ProcessStandardStage extends AbstractEntity {
  constructor(processStandardStage: Partial<ProcessStandardStage>) {
    super();
    Object.assign(this, processStandardStage);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_standard_stage_id: string;

  @Column('uuid')
  process_technical_standard_id: string;

  @Column()
  stage_title: string;

  @Column('int')
  stage_numberic_order: number;

  @Column('int')
  time_start: number;

  @Column('int')
  time_end: number;

  @ManyToOne(
    () => ProcessStandard,
    (processStandard) => processStandard.process_standard_stage,
  )
  @JoinColumn({ name: 'process_technical_standard_id' })
  process_standard_stage: ProcessStandard;

  @OneToMany(
    () => ProcessStandardStageContent,
    (processStandardStageContent) =>
      processStandardStageContent.process_standard_stage_content,
  )
  process_standard_stage_content: ProcessStandardStageContent[];

  @OneToMany(
    () => ProcessStandardStageMaterial,
    (processStandardStageMaterial) =>
      processStandardStageMaterial.process_standard_stage_material,
  )
  process_standard_stage_material: ProcessStandardStageMaterial[];
}
