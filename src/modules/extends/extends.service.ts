import { Injectable } from '@nestjs/common';
import { IExtendService } from './interfaces/IExtendService.interface';
import { CreateExtendDto } from './dto/create-extend.dto';

@Injectable()
export class ExtendsService implements IExtendService {
  createExtend(createExtendDTO: CreateExtendDto): Promise<any> {
    try {
      return;
    } catch (error) {}
  }
}
