import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProcessStandard } from './processStandard.entity';
import { JoinAttribute } from 'typeorm/query-builder/JoinAttribute';
import { TypeStageProcess } from '../../types/type-stage.enum';
import { ProcessStandardStageContent } from './processStandardStageContent.entity';

@Entity('processes_technical_standard_stage')
export class ProcessStandardStage extends AbstractEntity {
  constructor(processStandardStage: Partial<ProcessStandardStage>) {
    super();
    Object.assign(this, processStandardStage);
  }

  @Column('uuid', { name: 'process_standard_id', nullable: true })
  process_standard_id: string;

  @Column()
  title: string;

  @Column('int')
  numberic_order: number;
  @Column('int')
  time_start: number;
  @Column('int')
  time_end: number;

  @Column({
    type: 'enum',
    enum: TypeStageProcess,
  })
  type_stage: TypeStageProcess;
  @ManyToOne(
    () => ProcessStandard,
    (processStandard) => processStandard.process_standard_stage,
  )
  @JoinColumn({ name: 'process_standard_id' })
  process_standard_stage: ProcessStandard;

  @OneToMany(
    () => ProcessStandardStageContent,
    (processStandardStageContent) =>
      processStandardStageContent.process_standard_stage_content,
  )
  process_standard_stage_content: ProcessStandardStageContent[];
}
