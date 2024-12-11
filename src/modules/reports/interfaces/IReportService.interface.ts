import { IUser } from 'src/modules/auths/interfaces/IUser.interface';
import { CreateReportProcessStandardDTO } from '../dto/create-report-processStandard.dto';
import { CreateReportPurchaseDto } from '../dto/create-report-purchase.dto';
import { CreateReportDTO } from '../dto/create-report.dto';

export interface IReportService {
  createReportProcessStandard(data: CreateReportProcessStandardDTO): Promise<any>;

  createReportPurchase(data: CreateReportPurchaseDto, task_id: string, user: IUser): Promise<any>;

  createReport(data: CreateReportDTO, task_id: string, user: IUser): Promise<any>;

  getListReportByRequestId(request_id: string): Promise<any>;
}
