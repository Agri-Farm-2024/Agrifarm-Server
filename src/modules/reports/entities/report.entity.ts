import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ nullable: true })
  content: string;

  @Column({ default: 0, type: 'float' })
  quality_report: number;

  // @Column({ default: 0, type: 'float' })
  // quality_plant: number;

  // @Column({ default: 0, type: 'float' })
  // quality_plant_expect: number;

  // @Column({ default: 0 })
  // mass_plant: number;

  // @Column({ default: 0 })
  // mass_plant_expect: number;

  // @Column({ default: 0 })
  // price_purchase_per_kg: number;

  // relation
  @OneToMany(() => ReportURL, (reportURL) => reportURL.report)
  report_url: ReportURL[];

  @OneToOne(() => Task, (task) => task.report)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
