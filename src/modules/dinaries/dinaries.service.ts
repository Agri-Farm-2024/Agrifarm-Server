import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { IDinariesService } from './interfaces/IDinariesService.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DinaryStage } from './entities/dinaryStage.entity';
import { DinaryLink } from './entities/dinaryLink.entity';
import { LoggerService } from 'src/logger/logger.service';
import { ProcessesService } from '../processes/processes.service';
import { RequestsService } from '../requests/requests.service';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/types/request-status.enum';

@Injectable()
export class DinariesService implements IDinariesService {
  constructor(
    @InjectRepository(DinaryStage)
    private readonly dinariesStageRepo: Repository<DinaryStage>,

    @InjectRepository(DinaryLink)
    private readonly dinariesImageRepo: Repository<DinaryLink>,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => ProcessesService))
    private readonly processService: ProcessesService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,
  ) {}

  async createDinary(
    data: CreateDinaryDto,
    process_stage_content_id: string,
  ): Promise<any> {
    try {
      // get detail process stage content
      const request_process_stage_content_multivate: Request =
        await this.requestService.getDetailRequestCultivateProcess(
          process_stage_content_id,
        );
      if (
        request_process_stage_content_multivate.status !==
        RequestStatus.in_progress
      ) {
        throw new BadRequestException('Task not started yet');
      }
      //check if dinary stage exist
      const dinary_stage = await this.dinariesStageRepo.findOne({
        where: {
          process_technical_specific_stage_content_id: process_stage_content_id,
        },
      });
      // check dinary is exist
      if (dinary_stage) {
        //get dianry stage by process  technical stage content id
        const dinary_stage_view = await this.getDinaryStageByProcessContent(
          process_stage_content_id,
        );
        return dinary_stage_view;
      }
      //crete new dinary stage
      const new_dinary_stage = await this.dinariesStageRepo.save({
        ...data,
        process_technical_specific_stage_content_id: process_stage_content_id,
      });
      // create dinary image
      if (data.dinaries_image) {
        data.dinaries_image.forEach(async (image) => {
          await this.dinariesImageRepo.save({
            ...image,
            dinary_stage_id: new_dinary_stage.dinary_stage_id,
          });
        });
      }
      this.loggerService.log('New dinary stage created');
      // update request to completed
      await this.requestService.updateRequestStatus(
        request_process_stage_content_multivate.request_id,
        RequestStatus.completed,
      );
      return new_dinary_stage;
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
  async getDinaryStageByProcessSpecificId(
    process_specific_id: string,
  ): Promise<any> {
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
        relations: {
          dinaries_link: true,
          process_technical_specific_stage_content: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
