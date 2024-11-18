import { Payload } from 'src/modules/auths/types/payload.type';
import { CreateDinaryDto } from '../dto/create-dinary.dto';

export interface IDinariesService {
  createDinary(
    data: CreateDinaryDto,
    process_stage_content_id: string,
  ): Promise<any>;
}
