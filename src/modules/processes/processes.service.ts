import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  Param,
} from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { IProcessesService } from './interfaces/IProcessesService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { Repository } from 'typeorm';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { CreateProcessStageDto } from './dto/create-process-stage.dto';
import { CreateProcessStageContentDto } from './dto/create-process-stage-content.dto';
// import { PlantSeason } from '../plants/entities/plantSeason.entity';
import { CreateProcessStageMaterialDto } from './dto/create-process-stage-material.dto';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';
import { ReportsService } from '../reports/reports.service';

import { Payload } from '../auths/types/payload.type';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ProcessTechnicalStandardStatus } from './types/status-processStandard.enum';
import { UpdateProcessStandardDto } from './dto/update-processStandardStatus.dto';
import { ServiceSpecific } from '../servicesPackage/entities/serviceSpecific.entity';
import { ProcessSpecific } from './entities/specifics/processSpecific.entity';

@Injectable()
export class ProcessesService implements IProcessesService {
  private readonly logger = new Logger(ProcessesService.name);

  constructor(
    @InjectRepository(ProcessStandard)
    private readonly processStandardRepo: Repository<ProcessStandard>,

    @InjectRepository(ProcessStandardStage)
    private readonly processStandardStageRepo: Repository<ProcessStandardStage>,

    @InjectRepository(ProcessStandardStageContent)
    private readonly processStandardStageContentRepo: Repository<ProcessStandardStageContent>,

    @InjectRepository(ProcessStandardStageMaterial)
    private readonly processStandardStageMaterialRepo: Repository<ProcessStandardStageMaterial>,

    @Inject(forwardRef(() => ReportsService))
    private readonly reportService: ReportsService,
  ) {}

  async createProcessStandard(
    data: CreateProcessDto,
    expert: Payload,
  ): Promise<any> {
    try {
      //check if plant id and type process name is already exist
      const process = await this.processStandardRepo.findOne({
        where: {
          plant_season_id: data.plant_season_id,
        },
      });
      if (process) {
        throw new BadRequestException('plant season for process is exist');
      }
      //create new process
      const new_process = await this.processStandardRepo.save({
        ...data,
        expert_id: expert.user_id,
        name: data.name,
        plant_season_id: data.plant_season_id,
      });
      // create process stage
      if (data.stage) {
        const sortedStage = data.stage.sort(
          (a, b) => a.stage_numberic_order - b.stage_numberic_order,
        );
        for (const stage of sortedStage) {
          await this.createProcessStage(
            stage,
            new_process.process_technical_standard_id,
          );
        }
      }

      return new_process;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStage(
    data: CreateProcessStageDto,
    process_id: string,
  ): Promise<any> {
    try {
      const new_process_stage = await this.processStandardStageRepo.save({
        ...data,
        process_technical_standard_id: process_id,
      });
      // create process stage content and material

      if (data.content) {
        const sortedContent = data.content.sort(
          (a, b) => a.content_numberic_order - b.content_numberic_order,
        );
        for (const content of sortedContent) {
          await this.createProcessStageContent(
            content,
            new_process_stage.process_technical_standard_stage_id,
          );
        }
        if (data.material) {
          for (const material of data.material) {
            await this.createProcessStageMaterial(
              material,
              new_process_stage.process_technical_standard_stage_id,
            );
          }
        }
      }
      return new_process_stage;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStageContent(
    data: CreateProcessStageContentDto,
    process_stage_id: string,
  ): Promise<any> {
    try {
      return await this.processStandardStageContentRepo.save({
        ...data,
        process_technical_standard_stage_id: process_stage_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProcessStageMaterial(
    data: CreateProcessStageMaterialDto,
    process_stage_id: string,
  ): Promise<any> {
    try {
      //create process stage material
      return await this.processStandardStageMaterialRepo.save({
        ...data,
        process_technical_standard_stage_id: process_stage_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListProcessStandard(
    pagination: PaginationParams,
    status: ProcessTechnicalStandardStatus,
    plant_id: string,
  ): Promise<any> {
    try {
      // filter conditon by status and plant id
      const filter_condition: any = {};
      if (status) {
        filter_condition.status = status;
      }
      if (plant_id) {
        filter_condition.plant_season = {
          plant_id: plant_id,
        };
      }

      const [process_technical_standard, total_count] = await Promise.all([
        this.processStandardRepo.find({
          where: filter_condition,
          relations: {
            plant_season: {
              plant: true,
            },
            process_standard_stage: {
              process_standard_stage_content: true,
              process_standard_stage_material: true,
            },
            expert: true,
          },
          order: {
            process_standard_stage: {
              stage_numberic_order: 'ASC',
              process_standard_stage_content: {
                content_numberic_order: 'ASC',
              },
            },
          },
          select: {
            expert: {
              full_name: true,
              email: true,
              role: true,
              user_id: true,
            },
          },
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.processStandardRepo.count({
          where: filter_condition,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        process_technical_standard,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      console.error('Error fetching process standards:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  //update status of process

  async updateProcessStandardStatus(
    id: string,
    updateDto: UpdateProcessStandardDto,
  ): Promise<any> {
    try {
      const process = await this.processStandardRepo.findOne({
        where: {
          process_technical_standard_id: id,
        },
      });
      if (!process) {
        throw new BadRequestException('process not found');
      }
      const reason = (process.reason_of_reject = updateDto.reason_of_reject);
      if (!reason) {
        process.status = ProcessTechnicalStandardStatus.accepted;
      } else {
        (process.status = ProcessTechnicalStandardStatus.rejected),
          (process.reason_of_reject = updateDto.reason_of_reject);
      }

      return await this.processStandardRepo.save(process);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //delete process
  async removeProcessStandard(id: string): Promise<any> {
    try {
      const process = await this.processStandardRepo.findOne({
        where: {
          process_technical_standard_id: id,
        },
      });
      if (!process) {
        throw new BadRequestException('process not found');
      }
      process.status = ProcessTechnicalStandardStatus.in_active;
      return await this.processStandardRepo.save(process);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // create process sepecific
  async createProcessSpecific(serviceSpecfic: ServiceSpecific): Promise<any> {
    try {
      const time_start = serviceSpecfic.time_start;

      const plant_season_id = serviceSpecfic.plant_season_id;

      //take process standard by plant season id
      const processStandard = await this.processStandardRepo.findOne({
        where: {
          plant_season_id: plant_season_id,
        },
        relations: {
          process_standard_stage: {
            process_standard_stage_content: true,
            process_standard_stage_material: true,
          },
        },
      });
      if (!processStandard) {
        throw new BadRequestException('process not found');
      }

      const processSpecific = new ProcessSpecific({
        process_technical_specific_id: processStandard.process_technical_standard_id,
        
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
