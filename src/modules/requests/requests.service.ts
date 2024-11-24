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
import { ProcessTechnicalStandardStatus } from '../processes/types/status-processStandard.enum';
import { CreateRequestMaterialDto } from './dto/create-request-material-stagedto';
import { MaterialsService } from '../materials/materials.service';
import { ProcessSpecificStage } from '../processes/entities/specifics/processSpecificStage.entity';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';
import { CreateRequestPurchaseDto } from './dto/create-request-puchase.dto';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { BookingsService } from '../bookings/bookings.service';
import { ServiceSpecific } from '../servicesPackage/entities/serviceSpecific.entity';
import { Payload } from '../auths/types/payload.type';
import { createRequestTechnicalSupportDTO } from './dto/create-request-technical-support.dto';
import { ChannelsService } from '../channels/channels.service';
import { ServiceSpecificStatus } from '../servicesPackage/types/service-specific-status.enum';
import { RequestSupportType } from './types/request-support-type.enum';
import { ProcessSpecificStageContent } from '../processes/entities/specifics/processSpecificStageContent.entity';

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

    @Inject(forwardRef(() => BookingsService))
    private readonly bookingService: BookingsService,

    private readonly materialService: MaterialsService,

    private readonly notificationService: NotificationsService,

    private readonly servicePackageService: ServicesService,

    private readonly channelService: ChannelsService,
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
            created_at: 'DESC',
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

  /**
   * This function is used to update request status by call from other service
   * @function updateRequestStatus
   * @param request_id
   * @param status
   * @returns
   */

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
        relations: {
          task: {
            assign_to: true,
          },
        },
      });
      if (!request) {
        throw new BadRequestException('Request not found');
      }
      // check status is start
      if (status === RequestStatus.in_progress && request.time_start) {
        if (request.time_start > new Date()) {
          throw new BadRequestException('Not yet to start task');
        }
      }
      // check type of create process standard to update status process standard
      if (
        status == RequestStatus.pending_approval &&
        request.type == RequestType.create_process_standard
      ) {
        await this.processService.updateStatus(
          request.plant_season_id,
          ProcessTechnicalStandardStatus.pending,
        );
      }
      // check type of view land for sending mail to user
      if (
        status === RequestStatus.assigned &&
        request.type === RequestType.view_land
      ) {
        // send mail to user
        await this.mailService.sendMail(
          request.guest_email,
          SubjectMailEnum.landViewingSchedule,
          TemplateMailEnum.landViewingSchedule,
          {
            full_name: request.guest_full_name,
            time_start: request.time_start.toLocaleString(),
            staff_full_name: request.task.assign_to.full_name,
            staff_mail: request.task.assign_to.email,
            staff_phone: request.task.assign_to.phone,
            user_mail: request.guest_email,
            user_phone: request.guest_phone,
          },
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

  /**
   * Create request material call by schedule job
   * @function createRequestMaterial
   * @param createRequestMaterial
   * @returns
   */

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

  /**
   * Create request purchase call by schedule job
   * @function createRequestPurchaseAuto
   * @param createRequestPurchase
   * @returns
   */

  async createRequestPurchase(
    createRequestPurchase: CreateRequestPurchaseDto,
  ): Promise<any> {
    try {
      //check request purchase for service is exist
      const request_purchase_exist = await this.requestEntity.findOne({
        where: {
          service_specific_id: createRequestPurchase.service_specific_id,
          type: RequestType.product_purchase,
        },
      });
      if (request_purchase_exist) {
        throw new BadRequestException('Request purchase already exist');
      }
      //check service specific have service package have puchase
      const service_specific_detail: ServiceSpecific =
        await this.servicePackageService.getDetailServiceSpecific(
          createRequestPurchase.service_specific_id,
        );
      if (!service_specific_detail) {
        throw new BadRequestException('Service specific not found');
      }

      if (
        service_specific_detail.service_package.process_of_plant === true &&
        service_specific_detail.service_package.purchase === true
      ) {
        //create new request purchase
        const new_request = await this.requestEntity.save({
          ...createRequestPurchase,
          sender_id: service_specific_detail.landrenter_id,
          type: RequestType.product_purchase,
        });
        if (!new_request) {
          throw new BadRequestException('You do not use process of plant');
        }
        // create task for the request
        const new_task = await this.taskService.createTaskAuto(
          new_request.request_id,
          service_specific_detail.process_technical_specific.expert_id,
        );
        if (!new_task) {
          throw new BadRequestException('Unable to create task');
        }
        //update status request
        await this.updateRequestStatus(
          new_request.request_id,
          RequestStatus.assigned,
        );
        return new_request;
      }
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  /**
   * Create request purchase harvest by call from schedule job
   * @function createRequestPurchaseharvest
   * @param service_specific_id
   * @returns
   */

  async createRequestPurchaseharvest(
    service_specific_id: string,
  ): Promise<any> {
    try {
      //check request purchase for service is exist
      const request_purchase_hasvest_exist = await this.requestEntity.findOne({
        where: {
          service_specific_id: service_specific_id,
          type: RequestType.product_puchase_harvest,
        },
      });
      if (request_purchase_hasvest_exist) {
        throw new BadRequestException('Request purchase already exist');
      }
      //check service specific have service package have puchase
      const service_specific_detail: ServiceSpecific =
        await this.servicePackageService.getDetailServiceSpecific(
          service_specific_id,
        );
      if (!service_specific_detail) {
        throw new BadRequestException('Service specific not found');
      }
      //create new request purchase
      const new_request = await this.requestEntity.save({
        service_specific_id: service_specific_id,
        type: RequestType.product_puchase_harvest,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTaskAuto(
        new_request.request_id,
        service_specific_detail.booking_land.staff_id,
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

  async createRequestReportLand(booking_land: BookingLand): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestEntity.save({
        booking_land_id: booking_land.booking_id,
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
      // send noti to staff
      await this.notificationService.createNotification({
        user_id: booking_land.staff_id,
        title: NotificationTitleEnum.create_report_land,
        content: NotificationContentEnum.create_report_land(
          booking_land.land.name,
        ),
        component_id: new_request.request_id,
        type: NotificationType.request,
      });
      // send mail to user
      return new_request;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * function is used to update request to completed or rejected by staff or manager
   * @function confirmRequest
   * @param request_id
   * @param data
   * @returns
   */

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
      // check status is valid to complete or reject
      if (
        data.status !== RequestStatus.completed &&
        data.status !== RequestStatus.rejected
      ) {
        throw new BadRequestException('Invalid status to update');
      }

      // Check status of request is pending approval
      if (request.status !== RequestStatus.pending_approval) {
        throw new BadRequestException('Request is not pending approval');
      }
      /**
       * Condition to check type and status of request
       */
      if (data.status === RequestStatus.rejected) {
        // check is reason provided
        if (!data.reason_for_reject) {
          throw new BadRequestException('Reason is required');
        }
      }
      // Check condition of material process specific stage to update quantity material
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
        for (const item of process_specific_stage_detail.process_technical_specific_stage_material) {
          await this.materialService.updateQuantityMaterial(
            item.material_id,
            -item.quantity,
          );
        }
      }

      // check condition create request purchase harvest
      if (
        request.type === RequestType.product_purchase &&
        data.status === RequestStatus.completed
      ) {
        //create new request purchase hasvest
        await this.createRequestPurchaseharvest(request.service_specific_id);
      }

      //check request hasvest complete
      if (
        request.type === RequestType.product_puchase_harvest &&
        data.status === RequestStatus.completed
      ) {
        //create transaction
      }
      // Check condition of report land request
      if (
        request.type === RequestType.report_land &&
        data.status === RequestStatus.completed
      ) {
        // call boooking service to create transaction refund
        await this.bookingService.createRefundBooking(request.booking_land_id);

        // update request status
        const updated_request = await this.requestEntity.save({
          ...request,
          status: data.status,
        });

        return updated_request;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRequestTechnicalSupport(
    data: createRequestTechnicalSupportDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // check service exist
      if (data.service_specific_id) {
        const service_specific: ServiceSpecific =
          await this.servicePackageService.getDetailServiceSpecific(
            data.service_specific_id,
          );
        // check service is available
        if (service_specific.status !== ServiceSpecificStatus.used) {
          throw new BadRequestException('Service is not available');
        }
      }
      // create a new request
      const new_request = await this.requestEntity.save({
        ...data,
        sender_id: user.user_id,
      });
      // create task for the request
      await this.taskService.createTask(new_request.request_id);
      // check support type
      if (data.support_type === RequestSupportType.chat) {
        // create channel
      }
      return new_request;
    } catch (error) {}
  }

  async getAllRequestForDashbaoard(): Promise<any> {
    try {
      const [total_request, total_in_progress, total_completed] =
        await Promise.all([
          this.requestEntity.count(),
          this.requestEntity.count({
            where: {
              status: RequestStatus.in_progress,
            },
          }),
          this.requestEntity.count({
            where: {
              status: RequestStatus.completed,
            },
          }),
        ]);
      return {
        total_request,
        total_in_progress,
        total_completed,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRequestCultivateProcessContent(
    process_specific_stage_content: ProcessSpecificStageContent,
  ): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestEntity.save({
        process_technical_specific_stage_content_id:
          process_specific_stage_content.process_technical_specific_stage_content_id,
        time_start: process_specific_stage_content.time_start,
        type: RequestType.cultivate_process_content,
        status: RequestStatus.assigned,
      });
      // create task for the request
      await this.taskService.createTaskAuto(
        new_request.request_id,
        process_specific_stage_content.process_technical_specific_stage
          .process_technical_specific.expert_id,
      );
      // send noti to expert
      await this.notificationService.createNotification({
        user_id:
          process_specific_stage_content.process_technical_specific_stage
            .process_technical_specific.expert_id,
        title: NotificationTitleEnum.create_task,
        content: NotificationContentEnum.assigned_task(),
        component_id: new_request.request_id,
        type: NotificationType.request,
      });
      return new_request;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
