import { AbstractEntity } from 'src/database/postgres/entities/abstract.entity';
import { Entity } from 'typeorm';

@Entity('requests')
export class Request extends AbstractEntity {
  constructor(request: Partial<Request>) {
    super();
    Object.assign(this, request);
  }
}
