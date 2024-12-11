import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RequestSupportType } from '../types/request-support-type.enum';
import { RequestType } from '../types/request-type.enum';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { PlantSeason } from 'src/modules/plants/entities/plantSeason.entity';
import { RequestStatus } from '../types/request-status.enum';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { ProcessSpecificStage } from 'src/modules/processes/entities/specifics/processSpecificStage.entity';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ProcessSpecificStageContent } from 'src/modules/processes/entities/specifics/processSpecificStageContent.entity';
import { BookingMaterial } from 'src/modules/materials/entities/booking-material.entity';

@Entity('requests')
export class Request extends AbstractEntity {
  constructor(request: Partial<Request>) {
    super();
    Object.assign(this, request);
  }

  @PrimaryGeneratedColumn('uuid')
  request_id: string;

  @Column({ nullable: true })
  guest_full_name: string;

  @Column({ nullable: true })
  guest_email: string;

  @Column({ nullable: true })
  guest_phone: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: 'timestamptz' })
  time_start: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  time_end: Date;

  @Column({ nullable: true, type: 'uuid' })
  sender_id: string;

  @Column({ nullable: true, type: 'uuid' })
  plant_season_id: string;

  @Column({ nullable: true, type: 'uuid' })
  booking_land_id: string;

  @Column({ nullable: true, type: 'uuid' })
  process_technical_specific_stage_id: string;

  @Column({ nullable: true, type: 'uuid' })
  process_technical_specific_stage_content_id: string;

  @Column({ nullable: true, type: 'uuid' })
  service_specific_id: string;

  @Column({ nullable: true, type: 'uuid' })
  booking_material_id: string;

  @Column({
    default: RequestSupportType.direct,
    type: 'enum',
    enum: RequestSupportType,
  })
  support_type: RequestSupportType;

  @Column({ default: RequestType.view_land, type: 'enum', enum: RequestType })
  type: RequestType;

  @Column({ default: RequestStatus.pending, type: 'enum', enum: RequestStatus })
  status: RequestStatus;
  // Relations
  @ManyToOne(() => User, (user) => user.request, {
    nullable: true,
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToOne(() => Task, (task) => task.request)
  task: Task;

  @ManyToOne(() => PlantSeason, (plantSeason) => plantSeason.requests)
  @JoinColumn({ name: 'plant_season_id' })
  plant_season: PlantSeason;

  @ManyToOne(() => BookingLand, (booking) => booking.requests)
  @JoinColumn({ name: 'booking_land_id' })
  booking_land: BookingLand;

  @ManyToOne(() => ProcessSpecificStage, (process) => process.request)
  @JoinColumn({ name: 'process_technical_specific_stage_id' })
  process_technical_specific_stage: ProcessSpecificStage;

  @ManyToOne(() => ProcessSpecificStageContent, (process) => process.requests)
  @JoinColumn({ name: 'process_technical_specific_stage_content_id' })
  process_technical_specific_stage_content: ProcessSpecificStageContent;

  @ManyToOne(() => ServiceSpecific, (serviceSpecific) => serviceSpecific.requests)
  @JoinColumn({ name: 'service_specific_id' })
  service_specific: ServiceSpecific;

  @OneToOne(() => Channel, (channel) => channel.request)
  channel: Channel;

  @ManyToOne(() => BookingMaterial, (booking) => booking.requests)
  @JoinColumn({ name: 'booking_material_id' })
  booking_material: BookingMaterial;
}
