import { Payload } from 'src/modules/auths/types/payload.type';
import { CreateExtendDto } from '../dto/create-extend.dto';
import { UpdateExtendDTO } from '../dto/update-extend.dto';

export interface IExtendService {
  createExtend(createExtendDTO: CreateExtendDto): Promise<any>;

  createRequestExtend(booking_land_id: string): Promise<any>;

  updateExtend(
    data: UpdateExtendDTO,
    extend_id: string,
    user: Payload,
  ): Promise<any>;

  updateExtendToComplete(extend_id: string): Promise<any>;

  

}
