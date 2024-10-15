import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { OrderDetail } from 'src/modules/orders/entities/orderDetail.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('materials')
export class Material extends AbstractEntity {
  constructor(material: Partial<Material>) {
    super();
    Object.assign(this, material);
  }

  @Column()
  name: string;
  @Column()
  total_quantity: number;
  @Column()
  price_per_piece: number;
  @Column()
  deposit_per_piece: number;
  @Column()
  image_material: string;
  @Column()
  price_of_rent: number;
  @Column({
    type: 'enum',
    enum: ['buy', 'rent'],
  })
  type: string;
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.material_id)
  material_order_details_id: OrderDetail[];
}
