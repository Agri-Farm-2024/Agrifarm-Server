import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { ProcessStandard } from '../standards/processStandard.entity';
import { ProcessSpecificStage } from './processSpecificStage.entity';

@Entity('processes_technical_specific')
export class ProcessSpecific extends AbstractEntity {
  constructor(processSpecific: Partial<ProcessSpecific>) {
    super();
    Object.assign(this, processSpecific);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_specific_id: string;

  @Column('uuid')
  process_technical_standard_id: string;

  @Column('uuid', { nullable: true })
  expert_id: string;

  @Column()
  name: string;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column()
  qr_url: string;

  @ManyToOne(
    () => ProcessStandard,
    (processStandard) => processStandard.process_technical_standard,
  )
  @JoinColumn({ name: 'process_technical_standard_id' })
  process_technical_standard: ProcessStandard;

  @OneToMany(
    () => ProcessSpecificStage,
    (processSpecificStage) => processSpecificStage.process_technical_specific,
  )
  process_technical_specific_stage: ProcessSpecificStage[];
}