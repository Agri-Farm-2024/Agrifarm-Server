import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Dinary } from './dinary.entity';
import { DinaryImage } from './DinaryImange.entity';

@Entity('dinaries_stage')
export class DinaryStage extends AbstractEntity {
  constructor(dinaryStage: Partial<DinaryStage>) {
    super();
    Object.assign(this, dinaryStage);
  }

  @ManyToOne(() => Dinary, (dinary) => dinary.dinaries_stage, {
    nullable: true,
  })
  @JoinColumn({ name: 'dinary_id' })
  dinary: Dinary[];

  @ManyToOne(() => User, (user) => user.dinary_stage_by_writer, {
    nullable: true,
  })
  @JoinColumn({ name: 'writer_id' })
  writter: User[];

  @Column()
  content: string;

  @Column({
    default: 0,
  })
  numbered_order: number;

  @OneToMany(() => DinaryImage, (dinaryImage) => dinaryImage.dinary_image_id)
  dinaries_image: DinaryImage[];
}
