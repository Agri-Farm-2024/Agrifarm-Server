import e from 'express';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Plant } from 'src/modules/plants/entities/plant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { StatusProcessStandard } from '../../types/status-processStandard.enum';
import { TypeProcess } from '../../types/type-process.enum';
import { ProcessStandardStage } from './processStandardStage.entity';
@Entity('processes_technical_standard')
export class ProcessStandard extends AbstractEntity {
  constructor(processStandard: Partial<ProcessStandard>) {
    super();
    Object.assign(this, processStandard);
  }
  @Column('uuid')
  plant_id: string;

  @Column('uuid', { nullable: true })
  expert_id: string;

  @Column()
  name: string;

  @Column('int')
  total_month: number;

  @Column(null, { nullable: true })
  reason_of_reject: string;

  @Column({
    type: 'enum',
    enum: TypeProcess,
  })
  type_process: TypeProcess;

  @Column({
    type: 'enum',
    enum: StatusProcessStandard,
    default: StatusProcessStandard.pending,
  })
  status: StatusProcessStandard;

  @ManyToOne(() => Plant, (plant) => plant.process_standard)
  @JoinColumn({ name: 'plant_id' })
  plant_process_id: Plant;

  @ManyToOne(() => User, (user) => user.process_standard_by_expert)
  @JoinColumn({ name: 'expert_id' })
  expert: User;

  @OneToMany(
    () => ProcessStandardStage,
    (processStandardStage) => processStandardStage.process_standard_stage,
  )
  process_standard_stage: ProcessStandardStage[];
}
