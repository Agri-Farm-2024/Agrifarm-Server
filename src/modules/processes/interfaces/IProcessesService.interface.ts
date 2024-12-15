import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateProcessStandardDTO } from '../dto/create-process-standard.dto';
import { ProcessTechnicalStandardStatus } from '../types/status-processStandard.enum';
import { UpdateProcessStandardDto } from '../dto/update-process-standard-status.dto';
import { ProcessSpecificStatus } from '../types/processSpecific-status.enum';
import { UPdateProcessSpecificDto } from '../dto/update-process-specific.dto';
import { IUser } from 'src/modules/auths/interfaces/IUser.interface';
import { UpdateProcessStandardsDto } from '../dto/update-process-standard.dto';
import { ServiceSpecific } from 'src/modules/servicesPackage/entities/serviceSpecific.entity';

export interface IProcessesService {
  createProcessStandard(data: CreateProcessStandardDTO, expert: any): Promise<any>;

  getListProcessStandard(
    pagination: PaginationParams,
    status: ProcessTechnicalStandardStatus,
    plant_id: string,
  ): Promise<any>;

  updateProcessStandardStatus(id: string, updateDto: UpdateProcessStandardDto): Promise<any>;

  updateProcessStandard(
    process_technical_standard_id: string,
    data: UpdateProcessStandardsDto,
  ): Promise<any>;

  updateStatusProcessTechnicalStandardByRequest(
    plant_season_id: string,
    status: ProcessTechnicalStandardStatus,
  ): Promise<any>;

  removeProcessStandard(id: string): Promise<any>;

  createProcessSpecific(service_specific: ServiceSpecific): Promise<any>;

  getListProcessSpecific(
    pagination: PaginationParams,
    status: ProcessSpecificStatus,
    plant_id: string,
    user: IUser,
  ): Promise<any>;

  updateProcessSpecific(
    process_technical_specific_id: string,
    data: UPdateProcessSpecificDto,
    user: IUser,
  ): Promise<any>;

  updateStatusProcessSpecificToACtive(process_technical_specific_id: string): Promise<any>;

  checkAndCreateTaskProcessContentForExpert(): Promise<any>;

  CheckNewStageProcessSpecific(): Promise<any>;

  updateProcessSpecificPublic(process_specific_id: string, is_public: boolean): Promise<any>;

  updateMaterialSpecificStage(process_technical_specific_stage_id: string): Promise<void>;
}
