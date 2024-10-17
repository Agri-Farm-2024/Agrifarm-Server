import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LandStatus } from 'src/utils/status/land-status.enum';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Land } from './land.entity';

@Entity('lands_sub_description')
export class LandSubDescription extends AbstractEntity {
  constructor(land: Partial<LandSubDescription>) {
    super();
    Object.assign(this, land);
  }

  @Column('uuid', { name: 'land_id' })
  land_id: string;

  @Column()
  sub_title: string;

  @Column()
  sub_description: string;

  @ManyToOne(() => Land, (land) => land.sub_description, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_id' })
  land: Land;
}
