import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProcessStandardStage } from './processStandardStage.entity';
import { Material } from 'src/modules/materials/entities/material.entity';

@Entity('processes_technical_standard_stage_material')
export class ProcessStandardStageMaterial extends AbstractEntity {
  constructor(processStandardStageMaterial: Partial<ProcessStandardStageMaterial>) {
    super();
    Object.assign(this, processStandardStageMaterial);
  }

  @PrimaryGeneratedColumn('uuid')
  process_technical_standard_stage_material_id: string;

  @Column('uuid', { nullable: true })
  process_technical_standard_stage_id: string;

  @Column('uuid')
  material_id: string;

  @Column('int')
  quantity: number;
  // Relations
  @ManyToOne(
    () => ProcessStandardStage,
    (processStandardStage) => processStandardStage.process_standard_stage_content,
  )
  @JoinColumn({ name: 'process_technical_standard_stage_id' })
  process_standard_stage_material: ProcessStandardStage;

  @ManyToOne(() => Material, (material) => material.material_process_standard_stage_material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
