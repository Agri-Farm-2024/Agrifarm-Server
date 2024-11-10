import { request } from 'http';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportURL } from './reportURL.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';

@Entity('reports')
export class Report extends AbstractEntity {
  constructor(partial: Partial<Report>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @Column('uuid')
  task_id: string;

  @Column()
  content: string;
  // relation
  @OneToMany(() => ReportURL, (reportURL) => reportURL.report)
  report_url: ReportURL[];

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'report_from_id' })
  report_from: User;

  @OneToOne(() => Task, (task) => task.report)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
