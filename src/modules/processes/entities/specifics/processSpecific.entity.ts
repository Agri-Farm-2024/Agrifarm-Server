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
import { ProcessStandard } from '../standards/processStandard.entity';
import { ProcessSpecificStage } from './processSpecificStage.entity';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
import { ProcessSpecificStatus } from '../../types/processSpecific-status.enum';

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

  @Column('uuid')
  service_specific_id: string;

  @Column('uuid', { nullable: true })
  expert_id: string;

  @Column()
  time_start: Date;

  @Column()
  time_end: Date;

  @Column({ nullable: true })
  qr_url: string;

  @Column({
    type: 'enum',
    enum: ProcessSpecificStatus,
    default: ProcessSpecificStatus.pending,
  })
  status: ProcessSpecificStatus;

  // Relation
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

  @OneToOne(() => ServiceSpecific)
  @JoinColumn({ name: 'service_specific_id' })
  service_specific: ServiceSpecific;
}
