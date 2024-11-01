import { CreateReportProcessStandardDTO } from "../dto/create-report-processStandard.dto";

export interface IReportService {
    createReportProcessStandard(data: CreateReportProcessStandardDTO): Promise<any>;
}