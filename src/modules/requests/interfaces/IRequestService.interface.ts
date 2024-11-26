import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestViewLandDTO } from '../dto/create-request-view-land.dto';
import { RequestType } from '../types/request-type.enum';
import { CreateRequestProcessStandardDTO } from '../dto/create-request-processStandard.dto';
import { RequestStatus } from '../types/request-status.enum';
import { UpdateStatusTaskDTO } from '../dto/update-status-task.dto';
import { CreateRequestMaterialDto } from '../dto/create-request-material-stagedto';
import { IUser } from 'src/modules/auths/types/IUser.interface';
import { CreateRequestPurchaseDto } from '../dto/create-request-puchase.dto';
import { BookingLand } from 'src/modules/bookings/entities/bookingLand.entity';
import { createRequestTechnicalSupportDTO } from '../dto/create-request-technical-support.dto';
import { ProcessSpecificStageContent } from 'src/modules/processes/entities/specifics/processSpecificStageContent.entity';

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
    user: IUser,
  ): Promise<any>;

  createRequestPurchaseharvest(service_specific_id: string): Promise<any>;

  createRequestReportLand(booking_land: BookingLand): Promise<any>;

  getDetailRequestPrcocessStandard(plant_season_id: string): Promise<any>;

  createRequestCultivateProcessContent(
    process_specific_stage_content: ProcessSpecificStageContent,
  ): Promise<any>;

  createRequestTechnicalSupport(
    data: createRequestTechnicalSupportDTO,
    user: IUser,
  ): Promise<any>;

  confirmRequest(request_id: string, data: UpdateStatusTaskDTO): Promise<any>;
}
