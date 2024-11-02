import { CreateProcessDto } from "../dto/create-process.dto";

export interface IProcessesService {
    createProcessStandard( data: CreateProcessDto, expert: any): Promise<any>;

    getProcessStandard(plant_season_id: string): Promise<any>;
    
}