import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MaterialType } from '../types/material-type.enum';
import { MaterialStatus } from '../types/material-status.enum';
import { MaterialUnit } from '../types/material-unit-enum';
import { ProcessStandardStageMaterial } from 'src/modules/processes/entities/standards/processStandardStageMaterial.entity';
import { ProcessSpecificStageMaterial } from 'src/modules/processes/entities/specifics/processSpecificStageMaterial.entity';
import { BookingMaterialDetail } from './booking-material-detail.entity';

@Entity('materials')
export class Material extends AbstractEntity {
  constructor(material: Partial<Material>) {
    super();
    Object.assign(this, material);
  }

  @PrimaryGeneratedColumn('uuid')
  material_id: string;

  @Column()
  name: string;

  @Column('int')
  total_quantity: number;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MaterialUnit,
    default: MaterialUnit.bag,
  })
  unit: MaterialUnit;

  @Column({ nullable: true })
  price_per_piece: number;

  @Column({ default: 0 })
  quantity_of_rented: number;

  @Column({ nullable: true })
  deposit_per_piece: number;

  @Column({ nullable: true })
  image_material: string;

  @Column({ nullable: true })
  price_of_rent: number;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.buy,
  })
  type: MaterialType;

  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.available,
  })
  status: MaterialStatus;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.material)
  orders_detail: OrderDetail[];

  @OneToMany(
    () => ProcessStandardStageMaterial,
    (processStandardStageMaterial) => processStandardStageMaterial.material,
  )
  material_process_standard_stage_material: ProcessStandardStageMaterial[];

  @OneToMany(
    () => ProcessSpecificStageMaterial,
    (processSpecificSTageMaterial) =>
      processSpecificSTageMaterial.materialSpecific,
  )
  process_specific_stage_material: ProcessSpecificStageMaterial[];

  @OneToMany(
    () => BookingMaterialDetail,
    (bookingMaterialDetail) => bookingMaterialDetail.material,
  )
  material_booking_detail: BookingMaterialDetail[];
}
