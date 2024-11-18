import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { IDinariesService } from './interfaces/IDinariesService.interface';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryImage } from './entities/DinaryImange.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Payload } from '../auths/types/payload.type';

@Injectable()
export class DinariesService implements IDinariesService {
  constructor(
    @InjectRepository(DinaryStage)
    private readonly dinariesStageRepo: Repository<DinaryStage>,

    @InjectRepository(DinaryImage)
    private readonly dinariesImageRepo: Repository<DinaryImage>,

    private readonly loggerService: LoggerService,
  ) {}

  async createDinary(
    data: CreateDinaryDto,
    process_stage_content_id,
  ): Promise<any> {
    try {
      //check if dinary stage exist
      const dinary_stage = await this.dinariesStageRepo.findOne({
        where: {
          process_technical_stage_content_id: process_stage_content_id,
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
        throw new BadRequestException('the stage of process specific has been dinary stage already');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //update dinary stage
  async updateDinary(updateDinaryDto: UpdateDinaryDto,id:string): Promise<any> {
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
}
