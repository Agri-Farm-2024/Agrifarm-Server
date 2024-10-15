import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';

export interface IRequestService {
  createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any>;
}
