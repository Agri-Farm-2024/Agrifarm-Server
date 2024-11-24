import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';
import { RequestType } from '../types/request-type.enum';
import { CreateRequestProcessStandardDTO } from '../dto/create-request-processStandard.dto';
import { RequestStatus } from '../types/request-status.enum';
import { UpdateStatusTaskDTO } from '../dto/update-status-task.dto';
import { CreateRequestMaterialDto } from '../dto/create-request-material-stagedto';
import { Payload } from 'src/modules/auths/types/payload.type';
import { CreateRequestPurchaseDto } from '../dto/create-request-puchase.dto';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { createRequestTechnicalSupportDTO } from '../dto/create-request-technical-support.dto';

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

  createRequestPurchase(
    createRequestPurchase: CreateRequestPurchaseDto,
  ): Promise<any>;

  createRequestPurchaseharvest(service_specific_id: string): Promise<any>;

  createRequestReportLand(booking_land: BookingLand): Promise<any>;

  getDetailRequestPrcocessStandard(plant_season_id: string): Promise<any>;

  createRequestTechnicalSupport(
    data: createRequestTechnicalSupportDTO,
    user: Payload,
  ): Promise<any>;

  confirmRequest(request_id: string, data: UpdateStatusTaskDTO): Promise<any>;
}
