import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('lands')
export class Land extends AbstractEntity {
  constructor(land: Partial<Land>) {
    super();
    Object.assign(this, land);
  }

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 6, scale: 2 })
  acreage: number;

  @ManyToOne(() => User, (user) => user.Land_by_staff, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @ManyToOne(() => User, (user) => user.Land_by_land_renter, {
    nullable: true,
  })
  @JoinColumn({ name: 'land_renter_id' })
  land_renter: User;

  @Column('decimal', { precision: 10, scale: 2 })
  price_booking_per_month: number;
}
