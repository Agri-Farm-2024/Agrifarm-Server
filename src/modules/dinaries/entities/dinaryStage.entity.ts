import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dinary } from './dinary.entity';
import { DinaryImage } from './DinaryImange.entity';

@Entity('dinaries_stage')
export class DinaryStage extends AbstractEntity {
  constructor(dinaryStage: Partial<DinaryStage>) {
    super();
    Object.assign(this, dinaryStage);
  }

  @PrimaryGeneratedColumn('uuid')
  dinary_stage_id: string;

  @Column()
  content: string;

  @Column({
    default: 0,
  })
  numbered_order: number;

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

  @OneToMany(() => DinaryImage, (dinaryImage) => dinaryImage.dinary_image_id)
  dinaries_image: DinaryImage[];
}
