import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';
import { RequestFilterDTO } from '../dto/request-filter.dto';

export interface IRequestService {
  createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any>;

  // getListRequest(
  //   pagination: PaginationParams,
  //   filterDTO: RequestFilterDTO,
  // ): Promise<any>;
}
