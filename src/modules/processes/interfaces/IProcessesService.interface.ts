import { CreateProcessDto } from "../dto/create-process.dto";

export interface IProcessesService {
    createProcessStandard(data: CreateProcessDto): Promise<any>;
    
}