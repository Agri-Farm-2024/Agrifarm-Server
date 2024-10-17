import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProcessStandardStage } from './processStandardStage.entity';
@Entity('processes_standard_stage_content')
export class ProcessStandardStageContent extends AbstractEntity {
  constructor(
    processStandardStageContent: Partial<ProcessStandardStageContent>,
  ) {
    super();
    Object.assign(this, processStandardStageContent);
  }

  @Column('uuid', { name: 'process_standard_stage_id', nullable: true })
  process_standard_stage_id: string;

  @Column()
  tile: string;
  @Column()
  content: string;
  @Column('int')
  time_start: number;
  @Column('int')
  time_end: number;
  @Column('int')
  numberic_order: number;

  @ManyToOne(
    () => ProcessStandardStage,
    (processStandardStage) =>
      processStandardStage.process_standard_stage_content,
  )
  @JoinColumn({ name: 'process_standard_stage_id' })
  process_standard_stage_content: ProcessStandardStage;
}
