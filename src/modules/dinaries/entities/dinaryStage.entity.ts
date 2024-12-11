import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Entity, Column, JoinColumn, OneToMany, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { DinaryLink } from './dinaryLink.entity';
import { ProcessSpecificStageContent } from 'src/modules/processes/entities/specifics/processSpecificStageContent.entity';

@Entity('dinaries_stage')
export class DinaryStage extends AbstractEntity {
  constructor(dinaryStage: Partial<DinaryStage>) {
    super();
    Object.assign(this, dinaryStage);
  }

  @PrimaryGeneratedColumn('uuid')
  dinary_stage_id: string;

  @Column('uuid', { nullable: true })
  process_technical_specific_stage_content_id: string;

  @Column()
  content: string;

  @Column('float')
  quality_report: number;

  // relations
  @OneToMany(() => DinaryLink, (dinaryImage) => dinaryImage.đianry_stage)
  dinaries_link: DinaryLink[];

  @OneToOne(() => ProcessSpecificStageContent)
  @JoinColumn({ name: 'process_technical_specific_stage_content_id' })
  process_technical_specific_stage_content: ProcessSpecificStageContent;
}
