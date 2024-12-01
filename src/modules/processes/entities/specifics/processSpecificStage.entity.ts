import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProcessSpecific } from './processSpecific.entity';
import { ProcessSpecificStageContent } from './processSpecificStageContent.entity';
import { ProcessSpecificStageMaterial } from './processSpecificStageMaterial.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

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
  stage_title: string;

  @Column('int')
  stage_numberic_order: number;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;
  // Re;ations
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

  @OneToMany(
    () => Request,
    (request) => request.process_technical_specific_stage,
  )
  request: Request[];
}
