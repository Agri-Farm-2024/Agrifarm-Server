import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';
import { RequestType } from '../types/request-type.enum';
import { CreateRequestProcessStandardDTO } from '../dto/create-request-processStandard.dto';
import { RequestStatus } from '../types/request-status.enum';
import { UpdateStatusTaskDTO } from '../dto/update-status-task.dto';
import { CreateRequestMaterialDto } from '../dto/create-request-material-stagedto';
import { Payload } from 'src/modules/auths/types/payload.type';

export interface IRequestService {
  createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any>;

  getListRequest(
    pagination: PaginationParams,
    status: RequestStatus,
    type: RequestType,
  ): Promise<any>;

  getDetailRequest(request_id: string): Promise<any>;

  createRequestProcessStandard(
    data: CreateRequestProcessStandardDTO,
  ): Promise<any>;

  createRequestMaterial(
    createRequestMaterial: CreateRequestMaterialDto,
  ): Promise<any>;

  getDetailRequestPrcocessStandard(plant_season_id: string): Promise<any>;

  confirmRequest(request_id: string, data: UpdateStatusTaskDTO): Promise<any>;
}
