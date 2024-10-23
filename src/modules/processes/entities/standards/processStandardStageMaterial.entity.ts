import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProcessStandardStage } from './processStandardStage.entity';

@Entity('processes_technical_standard_stage_material')
export class ProcessStandardStageContent extends AbstractEntity {
  constructor(
    processStandardStageContent: Partial<ProcessStandardStageContent>,
  ) {
    super();
    Object.assign(this, processStandardStageContent);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_standard_stage_material_id: string;

  @Column('uuid', { nullable: true })
  process_technical_standard_stage_id: string;

  @Column('uuid')
  material_id: string;

  @ManyToOne(
    () => ProcessStandardStage,
    (processStandardStage) =>
      processStandardStage.process_standard_stage_content,
  )
  @JoinColumn({ name: 'process_standard_stage_id' })
  process_standard_stage_content: ProcessStandardStage;
}
