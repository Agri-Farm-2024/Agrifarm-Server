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
import { QualityPurchaseType } from '../types/quality-type-purchase.enum';

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

  @Column({ nullable: true })
  content: string;

  @Column({nullable: true})
  quality_plant: number;

  @Column({nullable: true})
  quality_plant_expect: number;

  @Column({ nullable: true })
  mass_plant: number;

  @Column({ nullable: true })
  mass_plant_expect: number;

  @Column({ nullable: true })
  price_purchase_per_kg: number;

  // relation
  @OneToMany(() => ReportURL, (reportURL) => reportURL.report)
  report_url: ReportURL[];

  @OneToOne(() => Task, (task) => task.report)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
