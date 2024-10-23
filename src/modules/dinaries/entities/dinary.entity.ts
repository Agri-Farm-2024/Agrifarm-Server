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
import { DinaryStage } from './dinaryStage.entity';

@Entity('dinaries')
export class Dinary extends AbstractEntity {
  constructor(dinary: Partial<Dinary>) {
    super();
    Object.assign(this, dinary);
  }

  @PrimaryGeneratedColumn('uuid')
  dianry_id: string;

  @ManyToOne(() => User, (user) => user.dinary_by_land_renter, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_renter_id' })
  land_renter_id: User;

  @OneToMany(() => DinaryStage, (dinaryStage) => dinaryStage.dinary)
  dinaries_stage: DinaryStage[];

  @Column()
  qr_link: string;
}
