import { CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
