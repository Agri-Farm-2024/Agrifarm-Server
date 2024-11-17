import { request } from 'http';
import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportUrlType } from '../types/report-url-type.enum';
import { Report } from './report.entity';

@Entity('reports_url')
export class ReportURL extends AbstractEntity {
  constructor(partial: Partial<ReportURL>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  report_url_id: string;

  @Column('uuid')
  report_id: string;

  @Column({ nullable: true })
  url_link: string;

  @Column({
    type: 'enum',
    enum: ReportUrlType,
    default: ReportUrlType.image,
  })
  url_type: ReportUrlType;

  @ManyToOne(() => Report, (report) => report.report_url)
  @JoinColumn({ name: 'report_id' })
  report: Report;
}
