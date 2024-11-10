import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateProcessDto } from '../dto/create-process.dto';
import { ProcessTechnicalStandardStatus } from '../types/status-processStandard.enum';
import { UpdateProcessStandardDto } from '../dto/update-processStandardStatus.dto';
import { ProcessSpecificStatus } from '../types/processSpecific-status.enum';
import { UPdateProcessSpecificDto } from '../dto/update-process-specific.dto';

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

  getListProcessSpecific(
    pagination: PaginationParams,
    status: ProcessSpecificStatus,
    plant_id: string,
  ): Promise<any>;

  updateProcessSpecific(
    process_technical_specific_id: string,
    data: UPdateProcessSpecificDto,
  ): Promise<any>;
}
