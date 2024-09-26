import { Injectable } from '@nestjs/common';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';

@Injectable()
export class DinariesService {
  create(createDinaryDto: CreateDinaryDto) {
    return 'This action adds a new dinary';
  }

  findAll() {
    return `This action returns all dinaries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dinary`;
  }

  update(id: number, updateDinaryDto: UpdateDinaryDto) {
    return `This action updates a #${id} dinary`;
  }

  remove(id: number) {
    return `This action removes a #${id} dinary`;
  }
}
