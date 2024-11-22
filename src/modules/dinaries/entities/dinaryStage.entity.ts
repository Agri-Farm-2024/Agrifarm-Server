import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

import { DinaryImage } from './DinaryImange.entity';
import { ProcessSpecificStageContent } from 'src/modules/processes/entities/specifics/processSpecificStageContent.entity';

@Entity('dinaries_stage')
export class DinaryStage extends AbstractEntity {
  constructor(dinaryStage: Partial<DinaryStage>) {
    super();
    Object.assign(this, dinaryStage);
  }

  @PrimaryGeneratedColumn('uuid')
  dinary_stage_id: string;

  @Column('uuid')
  process_technical_specific_stage_content_id: string;

  @Column()
  content: string;

  @Column('float')
  quality_report: number;

  @OneToMany(() => DinaryImage, (dinaryImage) => dinaryImage.đianry_stage)
  dinaries_image: DinaryImage[];

  @OneToOne(() => ProcessSpecificStageContent)
  @JoinColumn({ name: 'process_technical_specific_stage_content_id' })
  dinaries_stage_content: ProcessSpecificStageContent;
}
