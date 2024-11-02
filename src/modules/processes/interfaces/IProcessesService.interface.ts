import { CreateProcessDto } from '../dto/create-process.dto';

export interface IProcessesService {
  createProcessStandard(data: CreateProcessDto, expert: any): Promise<any>;

//   getProcessStandard(): Promise<GetProcessStandardResponse>;
// }
// export interface GetProcessStandardResponse {
//   message: string;
//   statusCode: number;
//   status: string;
//   metadata: ProcessStandard[];
// }

// export interface ProcessStandard {
//   process_technical_standard_id: string;
//   plant_season_id: string;
//   expert_id: string;
//   name: string;
//   reason_of_reject?: string; // Optional, if applicable
//   status: string;
//   stage: ProcessStandardStage[];
// }

// export interface ProcessStandardStage {
//   stage_title: string;
//   stage_numberic_order: number;
//   time_start: number;
//   time_end: number;
//   material: ProcessStandardStageMaterial[];
//   content: ProcessStandardStageContent[];
// }

// export interface ProcessStandardStageMaterial {
//   material_id: string;
//   quantity: number;
// }

// export interface ProcessStandardStageContent {
//   title: string;
//   content_numberic_order: number;
//   content: string;
//   time_start: number;
//   time_end: number;

}
