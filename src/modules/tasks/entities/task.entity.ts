import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Request } from 'src/modules/requests/entities/request.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('tasks')
export class Task extends AbstractEntity {
  constructor(partial: Partial<Task>) {
    super();
    Object.assign(this, partial);
  }

  @OneToOne(() => Request)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => User, (user) => user.task_assigned_by)
  @JoinColumn({ name: 'assigned_by_id' })
  assigned_by_id: User;

  @ManyToOne(() => User, (user) => user.task_assigned_to)
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to_id: User;
}
