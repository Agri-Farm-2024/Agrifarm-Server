import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { BookindLand } from 'src/modules/bookings/entities/bookindLand.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { LandStatus } from 'src/utils/status/land-status.enum';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Land } from './land.entity';
import { LandURLType } from '../types/land-url-type.enum';

@Entity('lands_url')
export class LandURL extends AbstractEntity {
  constructor(land: Partial<LandURL>) {
    super();
    Object.assign(this, land);
  }

  @Column()
  string_url: string;

  @Column({
    type: 'enum',
    enum: LandURLType,
    default: LandURLType.image,
  })
  type: LandURLType;

  @Column('uuid', { name: 'land_id' })
  land_id: string;

  @ManyToOne(() => Land, (land) => land.url, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_id' })
  land: Land;
}