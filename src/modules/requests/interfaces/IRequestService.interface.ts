import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';
import { RequestStatus } from 'src/utils/status/request-status.enum';
import { RequestType } from '../types/request-type.enum';

export interface IRequestService {
  createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any>;

  getListRequest(
    pagination: PaginationParams,
    status: RequestStatus,
    type: RequestType,
  ): Promise<any>;

  getDetailRequest(request_id: string): Promise<any>;
}
