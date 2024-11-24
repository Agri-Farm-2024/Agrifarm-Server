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
import { ProcessSpecificStage } from './processSpecificStage.entity';
import { DinaryStage } from 'src/modules/dinaries/entities/dinaryStage.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

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

  @Column('uuid', { nullable: true })
  process_technical_specific_stage_id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column('int')
  content_numberic_order: number;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;
  // Relation
  @ManyToOne(
    () => ProcessSpecificStage,
    (processSpecificStage) =>
      processSpecificStage.process_technical_specific_stage_content,
  )
  @JoinColumn({ name: 'process_technical_specific_stage_id' })
  process_technical_specific_stage: ProcessSpecificStage;

  @OneToOne(
    () => DinaryStage,
    (dinaryStage) => dinaryStage.process_technical_specific_stage_content,
  )
  dinary_stage: DinaryStage;

  @OneToMany(
    () => Request,
    (request) => request.process_technical_specific_stage_content,
  )
  requests: Request[];
}
