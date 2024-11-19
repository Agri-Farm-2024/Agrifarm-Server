import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IRequestService } from './interfaces/IRequestService.interface';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mails/mail.service';
import { LoggerService } from 'src/logger/logger.service';
import { TasksService } from '../tasks/tasks.service';
import { RequestType } from './types/request-type.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateRequestProcessStandardDTO } from './dto/create-request-processStandard.dto';
import { RequestStatus } from './types/request-status.enum';
import { UpdateStatusTaskDTO } from './dto/update-status-task.dto';
import { ProcessesService } from '../processes/processes.service';
import { ProcessStandard } from '../processes/entities/standards/processStandard.entity';
import { ProcessTechnicalStandardStatus } from '../processes/types/status-processStandard.enum';
import { CreateRequestMaterialDto } from './dto/create-request-material-stagedto';
import { Payload } from '../auths/types/payload.type';
import { request } from 'http';
import { Material } from '../materials/entities/material.entity';
import { MaterialsService } from '../materials/materials.service';
import { ProcessSpecificStage } from '../processes/entities/specifics/processSpecificStage.entity';

@Injectable()
export class RequestsService implements IRequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestEntity: Repository<Request>,

    private readonly mailService: MailService,

    private readonly loggerService: LoggerService,

    private readonly taskService: TasksService,

    @Inject(forwardRef(() => ProcessesService))
    private readonly processService: ProcessesService,

    private readonly materialService: MaterialsService,
  ) {}

  async createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestEntity.save({
        ...data,
        type: RequestType.view_land,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTask(
        new_request.request_id,
      );
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      this.loggerService.log(
        `New request view land created by ${data.guest_email}`,
      );
      // send mail
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListRequest(
    pagination: PaginationParams,
    status: RequestStatus,
    type: RequestType,
  ): Promise<any> {
    try {
      // const filter condition
      const filter_condition: any = {};
      // check if status and type is provided
      if (status) {
        filter_condition.status = status;
      }
      // check if type is provided
      if (type) {
        filter_condition.type = type;
      }
      // get list request
      const [requests, total_count] = await Promise.all([
        this.requestEntity.find({
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
          where: filter_condition,
          order: {
            status: 'ASC',
          },
        }),
        this.requestEntity.count({
          where: filter_condition,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        requests,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailRequest(request_id: string): Promise<any> {
    try {
      const request = await this.requestEntity.findOne({
        where: {
          request_id: request_id,
        },
        relations: {
          task: {
            assign_by: true,
            assign_to: true,
          },
        },
        select: {
          task: {
            task_id: true,
            assigned_at: true,
            assign_by: {
              user_id: true,
              email: true,
              full_name: true,
              role: true,
            },
            assign_to: {
              user_id: true,
              email: true,
              full_name: true,
              role: true,
            },
          },
        },
      });
      if (!request) {
        throw new BadRequestException('Request not found');
      }
      return request;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailRequestPrcocessStandard(
    plant_season_id: string,
  ): Promise<any> {
    try {
      const requestProcess = await this.requestEntity.findOne({
        where: {
          plant_season_id: plant_season_id,
          type: RequestType.create_process_standard,
        },
      });
      if (!requestProcess) {
        throw new BadRequestException('Request not found');
      }

      return requestProcess;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateRequestStatus(
    request_id: string,
    status: RequestStatus,
  ): Promise<any> {
    try {
      // check request exist
      const request = await this.requestEntity.findOne({
        where: {
          request_id: request_id,
        },
      });
      if (!request) {
        throw new BadRequestException('Request not found');
      }
      if (
        request.status == RequestStatus.pending_approval &&
        request.type == RequestType.create_process_standard
      ) {
        await this.processService.updateStatus(
          request.plant_season_id,
          ProcessTechnicalStandardStatus.pending,
        );
      }
      // update request status
      const updated_request = await this.requestEntity.save({
        ...request,
        status,
      });
      return updated_request;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //create request for expert to create processStandard
  async createRequestProcessStandard(
    data: CreateRequestProcessStandardDTO,
  ): Promise<any> {
    try {
      //check if request have plant_season_id
      const request_exist_plantseaosn = await this.requestEntity.findOne({
        where: {
          plant_season_id: data.plant_season_id,
          type: RequestType.create_process_standard,
        },
      });
      if (request_exist_plantseaosn) {
        throw new BadRequestException(
          'Request create this plant season already exist',
        );
      }

      // Create a new request
      const new_request = await this.requestEntity.save({
        ...data,
        type: RequestType.create_process_standard,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTask(
        new_request.request_id,
      );
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  //create request material
  async createRequestMaterial(
    createRequestMaterial: CreateRequestMaterialDto,
  ): Promise<any> {
    try {
      const request_exist_material = await this.requestEntity.findOne({
        where: {
          process_technical_specific_stage_id:
            createRequestMaterial.process_technical_specific_stage_id,
          type: RequestType.material_process_specfic_stage,
        },
      });
      if (request_exist_material) {
        throw new BadRequestException('Request material already exist');
      }
      // Create a new request
      const new_request = await this.requestEntity.save({
        ...createRequestMaterial,
        type: RequestType.material_process_specfic_stage,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request

      const process_specific_stage_detail =
        await this.processService.getDetailProcessSpecificStage(
          new_request.process_technical_specific_stage_id,
        );
      if (!process_specific_stage_detail) {
        throw new BadRequestException('Process specific stage not found');
      }
      const process_specific_detail =
        await this.processService.getDetailProcessSpecific(
          process_specific_stage_detail.process_technical_specific_id,
        );
      if (!process_specific_detail) {
        throw new BadRequestException('Process specific not found');
      }
      const new_task = await this.taskService.createTaskAuto(
        new_request.request_id,
        process_specific_detail.expert_id,
      );
      //update status request
      await this.updateRequestStatus(
        new_request.request_id,
        RequestStatus.assigned,
      );
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  async confirmRequest(
    request_id: string,
    data: UpdateStatusTaskDTO,
  ): Promise<any> {
    try {
      // check request exist
      const request = await this.requestEntity.findOne({
        where: {
          request_id: request_id,
        },
      });
      if (!request) {
        throw new BadRequestException('Request not found');
      }
      // check status is valid
      if (
        data.status !== RequestStatus.completed &&
        data.status !== RequestStatus.rejected
      ) {
        throw new BadRequestException('Invalid status to update');
      }

      // check default status of request
      if (request.status !== RequestStatus.pending_approval) {
        throw new BadRequestException('Request is not pending approval');
      } else {
        if (data.status === RequestStatus.rejected) {
          // check is reason provided
          if (!data.reason_for_reject) {
            throw new BadRequestException('Reason is required');
          }
        }
        //update type request material process specific stage
        if (
          request.type === RequestType.material_process_specfic_stage &&
          data.status === RequestStatus.completed
        ) {
          //update quantity material
          const process_specific_stage_detail: ProcessSpecificStage =
            await this.processService.getDetailProcessSpecificStage(
              request.process_technical_specific_stage_id,
            );
          if (!process_specific_stage_detail) {
            throw new BadRequestException('Process specific stage not found');
          }
          //   //update quantity material
          //   await this.materialService.updateQuantityMaterial(
          //     process_specific_stage_detail
          //       .process_technical_specific_stage_material.material_id,
          //     process_specific_stage_detail.quantity,
          //   );
          // }
          // update request status
          const updated_request = await this.requestEntity.save({
            ...request,
            status: RequestStatus.completed,
          });

          return updated_request;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRequestReportLand(booking_id: string): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestEntity.save({
        booking_land_id: booking_id,
        type: RequestType.report_land,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTask(
        new_request.request_id,
      );
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      // send noti to manager
      // send mail to user
      return new_request;
    } catch (error) {}
  }

  // create request take material of landrenter
}
