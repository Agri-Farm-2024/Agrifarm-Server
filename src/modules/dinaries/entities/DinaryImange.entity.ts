import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Dinary } from './dinary.entity';
import { DinaryStage } from './dinaryStage.entity';

@Entity('dinaries_image')
export class DinaryImage extends AbstractEntity {
  constructor(dinaryImage: Partial<DinaryImage>) {
    super();
    Object.assign(this, dinaryImage);
  }

  @ManyToOne(() => DinaryStage, (dinaryStage) => dinaryStage.dinaries_image, {
    nullable: true,
  })
  @JoinColumn({ name: 'dinary_stage_id' })
  dinary_image_id: Dinary[];

  @Column()
  image_link: string;
}
