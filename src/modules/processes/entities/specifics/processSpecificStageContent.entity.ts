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
import { ProcessSpecificStage } from './processSpecificStage.entity';

@Entity('processes_technical_specific_stage_content')
export class ProcessSpecificStageContent extends AbstractEntity {
  constructor(
    processSpecificStageContent: Partial<ProcessSpecificStageContent>,
  ) {
    super();
    Object.assign(this, processSpecificStageContent);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_specific_stage_content_id: string;

  @Column('uuid')
  process_technical_specific_stage_id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('int')
  numberic_order: number;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @ManyToOne(
    () => ProcessSpecificStage,
    (processSpecificStage) =>
      processSpecificStage.process_technical_specific_stage_content,
  )
  @JoinColumn({ name: 'process_technical_specific_stage_id' })
  process_technical_specific_stage: ProcessSpecificStage;
}
