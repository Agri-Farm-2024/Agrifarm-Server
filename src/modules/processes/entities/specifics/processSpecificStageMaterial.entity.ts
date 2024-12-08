import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column('uuid', { nullable: true })
  process_technical_specific_stage_id: string;

  @Column('uuid')
  material_id: string;

  @Column('int')
  quantity: number;

  @ManyToOne(
    () => ProcessSpecificStage,
    (processSpecificStage) =>
      processSpecificStage.process_technical_specific_stage_material,
  )
  @JoinColumn({ name: 'process_technical_specific_stage_id' })
  process_technical_specific_stage: ProcessSpecificStage;

  @ManyToOne(
    () => Material,
    (material) => material.process_specific_stage_material,
  )
  @JoinColumn({ name: 'material_id' })
  materialSpecific: Material;
}
