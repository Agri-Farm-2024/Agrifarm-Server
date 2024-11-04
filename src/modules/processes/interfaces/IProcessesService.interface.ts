import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessTechnicalStandardStatus } from '../types/status-processStandard.enum';
import { UpdateProcessStandardDto } from '../dto/update-processStandardStatus.dto';

export interface IProcessesService {
  createProcessStandard(data: CreateProcessDto, expert: any): Promise<any>;

  getListProcessStandard(
    pagination: PaginationParams,
    status: ProcessTechnicalStandardStatus,
    plant_id: string,
  ): Promise<any>;

  updateProcessStandardStatus(
    id: string,
    updateDto: UpdateProcessStandardDto,
  ): Promise<any>;

  removeProcessStandard(id: string): Promise<any>;
}
