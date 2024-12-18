import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class Task extends AbstractEntity {
  constructor(partial: Partial<Task>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column('uuid', { name: 'request_id', nullable: false })
  request_id: string;

  @Column('uuid', { name: 'assigned_by_id', nullable: true })
  assigned_by_id: string;

  @Column('uuid', { name: 'assigned_to_id', nullable: true })
  assigned_to_id: string;

  @Column({
    type: 'timestamptz',
    name: 'assigned_at',
    nullable: true,
  })
  assigned_at: Date;

  @OneToOne(() => Request, (request) => request.task)
  @JoinColumn({ name: 'request_id' })
  request: Request;
  // Relations
  @ManyToOne(() => User, (user) => user.task_assigned_by)
  @JoinColumn({ name: 'assigned_by_id' })
  assign_by: User;

  @ManyToOne(() => User, (user) => user.task_assigned_to)
  @JoinColumn({ name: 'assigned_to_id' })
  assign_to: User;

  @OneToOne(() => Report, (report) => report.task)
  report: Report;
}
