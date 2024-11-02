import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MaterialType } from '../types/material-type.enum';
import { MaterialStatus } from '../types/material-status.enum';
import { MaterialUnit } from '../types/material-unit-enum';

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

  @Column({
    type: 'enum',
    enum: MaterialUnit,

  })
  unit: MaterialUnit;

  @Column( { nullable: true })
  price_per_piece: number;

  @Column( { nullable: true })
  deposit_per_piece: number;

  @Column( { nullable: true })
  image_material: string;

  @Column( { nullable: true })
  price_of_rent: number;

  @Column({
    type: 'enum',
    enum: MaterialType,
  })
  type: MaterialType;

  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.active,
  })
  status: Material;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.material_id)
  material_order_details_id: OrderDetail[];
}
