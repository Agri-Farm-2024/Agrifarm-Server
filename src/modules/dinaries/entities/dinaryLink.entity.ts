import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DinaryStage } from './dinaryStage.entity';
import { DinaryURLType } from '../types/dinary-url-type.enum';

@Entity('dinaries_link')
export class DinaryLink extends AbstractEntity {
  constructor(dinaryImage: Partial<DinaryLink>) {
    super();
    Object.assign(this, dinaryImage);
  }

  @PrimaryGeneratedColumn('uuid')
  dinary_url_id: string;

  @Column('uuid')
  dinary_stage_id: string;

  @Column({
    nullable: true,
  })
  url_link: string;

  @Column({
    enum: DinaryURLType,
    default: DinaryURLType.image,
  })
  type: DinaryURLType;

  // relations
  @ManyToOne(() => DinaryStage, (dinaryStage) => dinaryStage.dinaries_link, {
    nullable: true,
  })
  @JoinColumn({ name: 'dinary_stage_id' })
  đianry_stage: DinaryStage;
}
