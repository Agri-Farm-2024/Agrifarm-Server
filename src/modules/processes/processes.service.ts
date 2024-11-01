import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProcessDto } from './dto/create-process.dto';
import { IProcessesService } from './interfaces/IProcessesService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessStandard } from './entities/standards/processStandard.entity';
import { In, Repository } from 'typeorm';
import { ProcessStandardStage } from './entities/standards/processStandardStage.entity';
import { ProcessStandardStageContent } from './entities/standards/processStandardStageContent.entity';
import { CreateProcessStageDto } from './dto/create-process-stage.dto';
import { CreateProcessStageContentDto } from './dto/create-process-stage-content.dto';
import { PlantSeason } from '../plants/entities/plantSeason.entity';
import { CreateProcessStageMaterialDto } from './dto/create-process-stage-material.dto';
import { ProcessStandardStageMaterial } from './entities/standards/processStandardStageMaterial.entity';
import { ReportsService } from '../reports/reports.service';
import { CreateReportProcessStandardDTO } from '../reports/dto/create-report-processStandard.dto';
import { Payload } from '../auths/types/payload.type';

@Injectable()
export class ProcessesService implements IProcessesService {
  constructor(
    @InjectRepository(ProcessStandard)
    private readonly processEntity: Repository<ProcessStandard>,
    @InjectRepository(ProcessStandardStage)
    private readonly processStandardStageEntity: Repository<ProcessStandardStage>,
    @InjectRepository(ProcessStandardStageContent)
    private readonly processStandardStageContentEntity: Repository<ProcessStandardStageContent>,
    @InjectRepository(ProcessStandardStageMaterial)
    private readonly processStandardStageMaterialEntity: Repository<ProcessStandardStageMaterial>,
    @Inject(forwardRef(() => ReportsService))
    private readonly reportService: ReportsService,
  ) {}

  async createProcessStandard(
    data: CreateProcessDto,
    expert: Payload,
  ): Promise<any> {
    try {
      //check if plant id and type process name is already exist
      const process = await this.processEntity.findOne({
        where: {
          plant_season_id: data.plant_season_id,
        },
      });
      if (process) {
        throw new BadRequestException('Process name already exist');
      }
      //create new process
      const new_process = await this.processEntity.save({
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
          await this.createProcessStage(stage, new_process.process_technical_standard_id);
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
      const new_process_stage = await this.processStandardStageEntity.save({
        ...data,
        process_technical_standard_id: process_id,
      });
      // create process stage content and material

      if (data.content) {
        const sortedContent = data.content.sort(
          (a, b) => a.content_numberic_order - b.content_numberic_order,
        );
        for (const content of sortedContent) {
          await this.createProcessStageContent(content, new_process_stage.process_technical_standard_stage_id);
        }
        if (data.material) {
          for (const material of data.material) {
            await this.createProcessStageMaterial(material, new_process_stage.process_technical_standard_stage_id);
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
      return await this.processStandardStageContentEntity.save({
        ...data,
        process_standard_stage_id: process_stage_id,
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
      return await this.processStandardStageMaterialEntity.save({
        ...data,
        process_standard_stage_id: process_stage_id,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //Getlist Standard Process
  async getProcessStandard(): Promise<any> {
    try {
      
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
