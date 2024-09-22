import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IUserEntity } from '../interfaces/IUserEntity.interface';

@Entity('users') // Maps this class to the 'users' table in the database
export class User implements IUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' }) // PostgreSQL supports the 'timestamptz' type
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
