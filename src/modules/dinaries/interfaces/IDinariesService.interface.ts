import { CreateDinaryDto } from '../dto/create-dinary.dto';
import { UpdateDinaryDto } from '../dto/update-dinary.dto';

export interface IDinariesService {
  createDinary(data: CreateDinaryDto, process_stage_content_id: string): Promise<any>;

  updateDinary(updateDinaryDto: UpdateDinaryDto, id: string): Promise<any>;

  getDinaryStageByProcessSpecificId(process_specific_id: string): Promise<any>;
}
