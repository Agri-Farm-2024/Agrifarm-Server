import { Entity, Column } from 'typeorm';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { UserRole } from 'src/utils/roles/user-role.enum';

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
}
