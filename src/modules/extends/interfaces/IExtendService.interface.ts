import { CreateExtendDto } from '../dto/create-extend.dto';

export interface IExtendService {
  createExtend(createExtendDTO: CreateExtendDto): Promise<any>;
}
