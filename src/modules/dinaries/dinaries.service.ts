import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { IDinariesService } from './interfaces/IDinariesService.interface';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryImage } from './entities/DinaryImange.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Payload } from '../auths/types/payload.type';
import { ProcessesService } from '../processes/processes.service';

@Injectable()
export class DinariesService implements IDinariesService {
  constructor(
    @InjectRepository(DinaryStage)
    private readonly dinariesStageRepo: Repository<DinaryStage>,

    @InjectRepository(DinaryImage)
    private readonly dinariesImageRepo: Repository<DinaryImage>,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => ProcessesService))
    private readonly processService: ProcessesService,
  ) {}

  async createDinary(
    data: CreateDinaryDto,
    process_stage_content_id: string,
  ): Promise<any> {
    try {
      //check if dinary stage exist
      const dinary_stage = await this.dinariesStageRepo.findOne({
        where: {
          process_technical_specific_stage_content_id: process_stage_content_id,
        },
      });
      if (!dinary_stage) {
        //crete new dinary stage
        const new_dinary_stage = await this.dinariesStageRepo.save({
          ...data,
          process_technical_stage_content_id: process_stage_content_id,
        });
        this.loggerService.log('New dinary stage created');
        return new_dinary_stage;
      } else {
        //get dianry stage by process  technical stage content id
        const dinary_stage_view = await this.getDinaryStageByProcessContent(
          process_stage_content_id,
        );
        this.loggerService.log('Dinary stage already exist');
        return dinary_stage_view;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //update dinary stage
  async updateDinary(
    updateDinaryDto: UpdateDinaryDto,
    id: string,
  ): Promise<any> {
    try {
      const dinary_stage = await this.dinariesStageRepo.findOne({
        where: {
          dinary_stage_id: id,
        },
      });
      if (!dinary_stage) {
        throw new BadRequestException('dinary stage not found');
      }
      const updated_dinary_stage = await this.dinariesStageRepo.save({
        ...dinary_stage,
        ...updateDinaryDto,
      });
      this.loggerService.log('Dinary stage updated');
      return updated_dinary_stage;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getDinaryStageByProcessContent(id: string): Promise<any> {
    try {
      const dinary_stage = await this.dinariesStageRepo.findOne({
        where: {
          process_technical_specific_stage_content_id: id,
        },
      });
      if (!dinary_stage) {
        throw new BadRequestException('dinary stage not found');
      }
      return dinary_stage;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //get list dianry by process spcific id
  async getDinaryStageByProcessSpecificId(process_specific_id): Promise<any> {
    try {
      const process_specific_exist =
        await this.processService.getDetailProcessSpecific(process_specific_id);
      if (!process_specific_exist) {
        throw new BadRequestException('Process specific not found');
      }
      return await this.dinariesStageRepo.find({
        where: {
          process_technical_specific_stage_content_id:
            process_specific_exist.process_technical_specific_stage
              .process_technical_standard_stage_content_id,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
