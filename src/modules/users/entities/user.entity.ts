import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { UserRole } from 'src/utils/roles/user-role.enum';
import { Land } from 'src/modules/lands/entities/land.entity';
import { Request } from 'src/modules/requests/entities/request.entity';

@Entity('users') // Maps this class to the 'users' table in the database
export class User extends AbstractEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.land_renter,
  })
  role: UserRole;

  @OneToMany(() => Land, (land) => land.staff)
  plants_by_staff: Land[];

  @OneToMany(() => Land, (land) => land.land_renter)
  plants_by_land_renter: Land[];

  @OneToMany(() => Request, (request) => request.land_renter)
  request_by_land_renter: Request[];
}
