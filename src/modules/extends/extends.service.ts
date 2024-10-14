import { Injectable } from '@nestjs/common';
import { CreateExtendDto } from './dto/create-extend.dto';
import { UpdateExtendDto } from './dto/update-extend.dto';

@Injectable()
export class ExtendsService {
  create(createExtendDto: CreateExtendDto) {
    return 'This action adds a new extend';
  }

  findAll() {
    return `This action returns all extends`;
  }

  findOne(id: number) {
    return `This action returns a #${id} extend`;
  }

  update(id: number, updateExtendDto: UpdateExtendDto) {
    return `This action updates a #${id} extend`;
  }

  remove(id: number) {
    return `This action removes a #${id} extend`;
  }
}
