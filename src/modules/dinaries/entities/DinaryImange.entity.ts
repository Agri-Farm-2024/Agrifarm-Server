import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DinaryStage } from './dinaryStage.entity';

@Entity('dinaries_image')
export class DinaryImage extends AbstractEntity {
  constructor(dinaryImage: Partial<DinaryImage>) {
    super();
    Object.assign(this, dinaryImage);
  }

  @PrimaryGeneratedColumn('uuid')
  dinary_image_id: string;

  @ManyToOne(() => DinaryStage, (dinaryStage) => dinaryStage.dinaries_image, {
    nullable: true,
  })
  @JoinColumn({ name: 'dinary_stage_id' })
  đianry_stage: DinaryStage;

  @Column()
  image_link: string;
}
