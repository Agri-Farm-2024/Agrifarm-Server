import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProcessStandardStage } from './processStandardStage.entity';
@Entity('processes_technical_standard_stage_content')
export class ProcessStandardStageContent extends AbstractEntity {
  constructor(
    processStandardStageContent: Partial<ProcessStandardStageContent>,
  ) {
    super();
    Object.assign(this, processStandardStageContent);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_standard_stage_content_id: string;

  @Column('uuid', { nullable: true })
  process_technical_standard_stage_id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('int')
  time_start: number;

  @Column('int')
  time_end: number;

  @Column('int')
  content_numberic_order: number;

  @ManyToOne(
    () => ProcessStandardStage,
    (processStandardStage) =>
      processStandardStage.process_standard_stage_content,
  )
  @JoinColumn({ name: 'process_technical_standard_stage_id' })
  process_standard_stage_content: ProcessStandardStage;
}
