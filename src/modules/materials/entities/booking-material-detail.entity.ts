import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingMaterial } from './booking-material.entity';
import { Material } from './material.entity';

@Entity('booking_material_detail')
export class BookingMaterialDetail extends AbstractEntity {
  constructor(bookingMaterialDetail: Partial<BookingMaterialDetail>) {
    super();
    Object.assign(this, bookingMaterialDetail);
  }

  @PrimaryGeneratedColumn('uuid')
  booking_material_detail_id: string;

  @Column('uuid', { name: 'booking_material_id' })
  booking_material_id: string;

  @Column('uuid', { name: 'material_id' })
  material_id: string;

  @Column('int')
  quantity: number;

  @Column('int')
  price_deposit_per_item: number;

  @Column('int')
  price_per_piece_item: number;
  // Relations
  @ManyToOne(
    () => BookingMaterial,
    (bookingMaterial) => bookingMaterial.booking_material_id,
  )
  @JoinColumn({ name: 'booking_material_id' })
  bookingMaterial: BookingMaterial;

  @ManyToOne(() => Material, (material) => material.material_booking_detail)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
