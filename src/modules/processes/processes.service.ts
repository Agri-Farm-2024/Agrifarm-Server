import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class ProcessesService implements IProcessesService {
  constructor(
    @InjectRepository(ProcessStandard)
    private readonly processEntity: Repository<ProcessStandard>,
    @InjectRepository(ProcessStandardStage)
    private readonly processStandardStageEntity: Repository<ProcessStandardStage>,
    @InjectRepository(ProcessStandardStageContent)
    private readonly processStandardStageContentEntity: Repository<ProcessStandardStageContent>,
  ) {}

  async createProcessStandard(data: CreateProcessDto): Promise<any> {
    try {
      //check if plant id and type process name is already exist
      const process = await this.processEntity.findOne({
        where: {
          plant_id: data.plant_id,
          type_process: data.type_process,
        },
      });
      if (process) {
        throw new BadRequestException('Process name already exist');
      }
      //create new process
      const new_process = await this.processEntity.save({
        name: data.name,
        plant_id: data.plant_id,
        total_month: data.total_month,
        type_process: data.type_process,
      });
      // create process stage
      if (data.stage) {
        const sortedStage = data.stage.sort(
          (a, b) => a.numberic_order - b.numberic_order,
        );
        for (let i = 0; i < sortedStage.length; i++) {
          await this.createProcessStage(data.stage[i], new_process.id);
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
        process_standard_stage_id: process_id,
      });
      // create process stage content
      if (data.content) {
        const sortedContent = data.content.sort(
          (a, b) => a.numberic_order - b.numberic_order,
        );
        for (let i = 0; i < sortedContent.length; i++) {
          await this.createProcessStageContent(
            data.content[i],
            new_process_stage.id,
          );
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

  findAll() {
    return `This action returns all processes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} process`;
  }

  remove(id: number) {
    return `This action removes a #${id} process`;
  }
}
