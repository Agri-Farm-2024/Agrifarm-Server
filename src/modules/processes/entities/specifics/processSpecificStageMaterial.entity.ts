import e from 'express';
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
import { Material } from 'src/modules/materials/entities/material.entity';

@Entity('processes_technical_specific_stage_material')
export class ProcessSpecificStageMaterial extends AbstractEntity {
  constructor(
    processSpecificStageMaterial: Partial<ProcessSpecificStageMaterial>,
  ) {
    super();
    Object.assign(this, processSpecificStageMaterial);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_specific_stage_material_id: string;

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
      processSpecificStage.process_technical_specific_stage_material,
  )
  @JoinColumn({ name: 'process_technical_specific_stage_id' })
  process_technical_specific_stage: ProcessSpecificStage;

  @OneToMany(
    () => Material,
    (material) => material.process_specific_stage_material,
  )
  @JoinColumn({ name: 'material_id' })
  materialSpecific: Material;
}
