import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { IUser } from '../auths/interfaces/IUser.interface';
import { createRequestTechnicalSupportDTO } from './dto/create-request-technical-support.dto';
import { ServiceSpecificStatus } from '../servicesPackage/types/service-specific-status.enum';
import { ProcessSpecificStageContent } from '../processes/entities/specifics/processSpecificStageContent.entity';
import { selectUser } from 'src/utils/select.util';
import { UserRole } from '../users/types/user-role.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { TransactionType } from '../transactions/types/transaction-type.enum';
import { getDateWithoutTime, getTimeByPlusDays, getTimeByPlusMonths } from 'src/utils/time.utl';

@Injectable()
export class RequestsService implements IRequestService {
  private readonly logger = new Logger(RequestsService.name);
  constructor(
    @InjectRepository(Request)
    private readonly requestRepo: Repository<Request>,

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

    private readonly transactionService: TransactionsService,
  ) {}

  /**
   * Create request view land
   * @param CreateRequestViewLandDTO
   * @returns
   */

  async createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any> {
    try {
      // Create a new request
      const new_request = await this.requestRepo.save({
        ...data,
        type: RequestType.view_land,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTask(new_request.request_id);
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      this.loggerService.log(`New request view land created by ${data.guest_email}`);
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

  /**
   * Get list request by status and type
   * @param pagination
   * @param status
   * @param type
   * @param user
   * @returns
   */

  async getListRequest(
    pagination: PaginationParams,
    status: RequestStatus,
    type: RequestType,
    user: IUser,
  ): Promise<any> {
    try {
      // const filter condition
      const filter_condition: any = {};
      // Check if user is staff
      if (user.role === UserRole.staff && type === RequestType.view_land) {
        filter_condition.task.assigned_to_id = user.user_id;
      }
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
        this.requestRepo.find({
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
          where: filter_condition,
          relations: {
            task: {
              assign_by: true,
              assign_to: true,
              report: {
                report_url: true,
              },
            },
            sender: true,
            process_technical_specific_stage_content: {
              dinary_stage: {
                dinaries_link: true,
              },
            },
            booking_land: {
              land: true,
              land_renter: true,
            },
            channel: true,
            plant_season: {
              plant: true,
            },
            process_technical_specific_stage: true,
            service_specific: {
              land_renter: true,
              plant_season: {
                plant: true,
              },
            },
          },
          order: {
            updated_at: 'DESC',
          },
        }),
        this.requestRepo.count({
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

  /**
   *  Get detail request by request_id
   * @param request_id
   * @returns
   */

  async getDetailRequest(request_id: string): Promise<any> {
    try {
      const request = await this.requestRepo.findOne({
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
            assign_by: selectUser,
            assign_to: selectUser,
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

  /**
   * Get detail request by plant_season_id
   * @param plant_season_id
   * @returns
   */

  async getDetailRequestPrcocessStandard(plant_season_id: string): Promise<any> {
    try {
      const requestProcess = await this.requestRepo.findOne({
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
   * Get detail request by process_technical_specific_stage_content_id
   * @param process_technical_specific_stage_content_id
   * @returns
   */

  async getDetailRequestCultivateProcess(
    process_technical_specific_stage_content_id: string,
  ): Promise<any> {
    try {
      const requestCultivate = await this.requestRepo.findOne({
        where: {
          process_technical_specific_stage_content_id: process_technical_specific_stage_content_id,
          type: RequestType.cultivate_process_content,
        },
      });
      if (!requestCultivate) {
        throw new BadRequestException(`Don't have request for this cultivate`);
      }
      return requestCultivate;
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

  async updateRequestStatus(request_id: string, status: RequestStatus): Promise<any> {
    try {
      // check request exist
      const request = await this.requestRepo.findOne({
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
      // // check type of create process standard to update status process standard
      // if (
      //   status == RequestStatus.completed &&
      //   request.type == RequestType.create_process_standard
      // ) {
      //   await this.processService.updateStatusProcessTechnicalStandardByRequest(
      //     request.plant_season_id,
      //     ProcessTechnicalStandardStatus.accepted,
      //   );
      // }
      // Check type of material process specific stage to update status process specific stage
      if (
        status === RequestStatus.completed &&
        request.type === RequestType.material_process_specfic_stage
      ) {
        await this.processService.updateMaterialSpecificStage(
          request.process_technical_specific_stage_id,
        );
      }
      // check type of view land for sending mail to user
      if (status === RequestStatus.assigned && request.type === RequestType.view_land) {
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
      const updated_request = await this.requestRepo.update(
        {
          request_id: request_id,
        },
        {
          status,
        },
      );
      return updated_request;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Create request process standard
   * @param data
   * @returns
   */

  async createRequestProcessStandard(data: CreateRequestProcessStandardDTO): Promise<any> {
    try {
      //check if request have plant_season_id
      const request_exist_plantseaosn = await this.requestRepo.findOne({
        where: {
          plant_season_id: data.plant_season_id,
          type: RequestType.create_process_standard,
        },
      });
      if (request_exist_plantseaosn) {
        throw new BadRequestException('Request create this plant season already exist');
      }

      // Create a new request
      const new_request = await this.requestRepo.save({
        ...data,
        type: RequestType.create_process_standard,
      });
      // create task for the request
      await this.taskService.createTask(new_request.request_id);

      return new_request;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.loggerService.error(error.message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Create request material by stage process specific call by schedule job
   * @param process_specific_stage
   * @returns
   */

  async createRequestMaterial(process_specific_stage: ProcessSpecificStage): Promise<void> {
    try {
      // set time start is  0h next day
      console.log(getTimeByPlusDays(getDateWithoutTime(new Date()), 1));
      const request_exist_material = await this.requestRepo.findOne({
        where: {
          process_technical_specific_stage_id:
            process_specific_stage.process_technical_specific_stage_id,
          type: RequestType.material_process_specfic_stage,
          time_start: getTimeByPlusDays(getDateWithoutTime(new Date()), 1),
        },
      });
      if (!request_exist_material) {
        // Create a new request
        const new_request = await this.requestRepo.save({
          process_technical_specific_stage_id:
            process_specific_stage.process_technical_specific_stage_id,
          type: RequestType.material_process_specfic_stage,
          status: RequestStatus.assigned,
        });
        await this.taskService.createTaskAuto(
          new_request.request_id,
          process_specific_stage.process_technical_specific.expert_id,
        );
      }
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  /**
   * Create request purchase call by schedule job
   * @function createRequestPurchase
   * @param createRequestPurchase
   * @returns
   */

  async createRequestPurchase(createRequestPurchase: CreateRequestPurchaseDto): Promise<any> {
    try {
      //check request purchase for service is exist
      const request_purchase_exist = await this.requestRepo.findOne({
        where: {
          service_specific_id: createRequestPurchase.service_specific_id,
          type: RequestType.product_purchase,
          time_start: getDateWithoutTime(new Date()),
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

      if (service_specific_detail.service_package.purchase === true) {
        //create new request purchase
        const new_request = await this.requestRepo.save({
          ...createRequestPurchase,
          sender_id: service_specific_detail.landrenter_id,
          type: RequestType.product_purchase,
          status: RequestStatus.assigned,
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
        await this.updateRequestStatus(new_request.request_id, RequestStatus.assigned);

        // create Notication for expert
        await this.notificationService.createNotification({
          user_id: service_specific_detail.process_technical_specific.expert_id,
          title: NotificationTitleEnum.create_task,
          content: NotificationContentEnum.assigned_task(),
          component_id: new_request.request_id,
          type: NotificationType.request,
        });

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

  async createRequestPurchaseharvest(service_specific_id: string): Promise<any> {
    try {
      //check request purchase for service is exist
      const request_purchase_hasvest_exist = await this.requestRepo.findOne({
        where: {
          service_specific_id: service_specific_id,
          type: RequestType.product_puchase_harvest,
          time_start: getTimeByPlusMonths(getDateWithoutTime(new Date()), 1),
        },
      });
      if (request_purchase_hasvest_exist) {
        throw new BadRequestException('Request purchase already exist');
      }
      //check service specific have service package have puchase
      const service_specific_detail: ServiceSpecific =
        await this.servicePackageService.getDetailServiceSpecific(service_specific_id);
      if (!service_specific_detail) {
        throw new BadRequestException('Service specific not found');
      }
      //create new request purchase
      const new_request = await this.requestRepo.save({
        service_specific_id: service_specific_id,
        type: RequestType.product_puchase_harvest,
      });
      if (!new_request) {
        throw new BadRequestException('Unable to create request');
      }
      // create task for the request
      const new_task = await this.taskService.createTaskAuto(
        new_request.request_id,
        service_specific_detail.process_technical_specific.expert_id,
      );
      //update status request
      await this.updateRequestStatus(new_request.request_id, RequestStatus.assigned);
      if (!new_task) {
        throw new BadRequestException('Unable to create task');
      }
      //create notification for land renter
      await this.notificationService.createNotification({
        user_id: service_specific_detail.landrenter_id,
        title: NotificationTitleEnum.create_request_purchase_harvest,
        content: NotificationContentEnum.create_request_purchase_harvest(
          service_specific_detail.booking_land.land.name,
        ),
        component_id: service_specific_detail.service_specific_id,
        type: NotificationType.service,
      });
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Create request report land call when booking land is expired by schedule job
   * @param booking_land
   */

  async createRequestReportLand(booking_land: BookingLand): Promise<void> {
    try {
      // check request exist
      const request_exist = await this.requestRepo.findOne({
        where: {
          booking_land_id: booking_land.booking_id,
          type: RequestType.report_land,
        },
      });
      if (!request_exist) {
        // Create a new request
        const new_request = await this.requestRepo.save({
          booking_land_id: booking_land.booking_id,
          type: RequestType.report_land,
        });
        // create task for the request
        await this.taskService.createTask(new_request.request_id);
        // send noti to staff
        await this.notificationService.createNotification({
          user_id: booking_land.staff_id,
          title: NotificationTitleEnum.create_report_land,
          content: NotificationContentEnum.create_report_land(booking_land.land.name),
          component_id: new_request.request_id,
          type: NotificationType.request,
        });
        // log
        this.logger.log(`New request report land created for ${booking_land.booking_id}`);
        this.loggerService.log(`New request report land created for ${booking_land.booking_id}`);
      }
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  /**
   * Update request to completed or rejected by staff or manager
   * @param request_id
   * @param data
   * @returns
   */

  async confirmRequest(request_id: string, data: UpdateStatusTaskDTO): Promise<any> {
    try {
      // check request exist
      const request = await this.requestRepo.findOne({
        where: {
          request_id: request_id,
        },
        relations: {
          task: {
            report: true,
          },
          service_specific: true,
          booking_land: {
            land: true,
            land_renter: true,
          },
        },
      });
      if (!request) {
        throw new BadRequestException('Request not found');
      }
      // check status is valid to complete or reject
      if (data.status !== RequestStatus.completed && data.status !== RequestStatus.rejected) {
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
          await this.materialService.updateQuantityMaterial(item.material_id, -item.quantity);
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
        const transactionData: Partial<CreateTransactionDTO> = {
          service_specific_id: request.service_specific_id,
          total_price:
            request.service_specific.price_purchase_per_kg *
            request.task.report.quality_plant *
            (request.task.report.mass_plant / 1000),
          purpose: TransactionPurpose.service_purchase_product,
          user_id: request.service_specific.landrenter_id,
          type: TransactionType.refund,
        };
        await this.transactionService.createTransaction(transactionData as CreateTransactionDTO);
      }
      // Check condition of report land with completed status
      if (request.type === RequestType.report_land && data.status === RequestStatus.completed) {
        // call boooking service to create transaction refund
        await this.bookingService.createRefundBooking(request.booking_land);
      }
      // CHeck condition of report booking material with completed status
      if (
        request.type === RequestType.report_booking_material &&
        data.status === RequestStatus.completed
      ) {
        // // call booking service to create transaction refund
        await this.materialService.createRefundTransactionBookingMaterial(request);
      }
      // Check condition of report service specific with completed status
      if (
        request.type === RequestType.report_service_specific &&
        data.status === RequestStatus.completed
      ) {
        // call service package service to create transaction refund
        await this.servicePackageService.createRefundTransactionServiceSpecific(request);
      }
      // Check condition of request purchase with completed status
      if (
        request.type === RequestType.create_process_standard &&
        data.status === RequestStatus.completed
      ) {
        await this.processService.updateStatusProcessTechnicalStandardByRequest(
          request.plant_season_id,
          ProcessTechnicalStandardStatus.accepted,
        );
      }
      // update request status
      const updated_request = await this.requestRepo.update(
        {
          request_id: request_id,
        },
        {
          status: data.status,
        },
      );
      // log
      this.loggerService.log(`Request ${request_id} is updated to ${data.status}`);
      return updated_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRequestTechnicalSupport(
    data: createRequestTechnicalSupportDTO,
    user: IUser,
  ): Promise<any> {
    try {
      // check service exist
      if (data.service_specific_id) {
        const service_specific: ServiceSpecific =
          await this.servicePackageService.getDetailServiceSpecific(data.service_specific_id);
        // check service is available
        if (service_specific.status !== ServiceSpecificStatus.used) {
          throw new BadRequestException('Service is not available');
        }
        // create a new request
        const new_request = await this.requestRepo.save({
          ...data,
          sender_id: user.user_id,
          status: RequestStatus.assigned,
          type: RequestType.technical_support,
        });
        // assign auto task
        await this.taskService.createTaskAuto(
          new_request.request_id,
          service_specific.process_technical_specific.expert_id,
        );
        // return
        return new_request;
      }
      // create a new request
      const new_request = await this.requestRepo.save({
        ...data,
        sender_id: user.user_id,
        type: RequestType.technical_support,
      });
      // create task for the request
      await this.taskService.createTask(new_request.request_id);
      return new_request;
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get all request for dashboard
   * @function getAllRequestForDashbaoard
   * @returns
   */

  async getAllRequestForDashbaoard(): Promise<any> {
    try {
      const [total_request, total_in_progress, total_completed] = await Promise.all([
        this.requestRepo.count(),
        this.requestRepo.count({
          where: {
            status: RequestStatus.in_progress,
          },
        }),
        this.requestRepo.count({
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
  ): Promise<void> {
    try {
      // check exist
      const request_exist = await this.requestRepo.findOne({
        where: {
          process_technical_specific_stage_content_id:
            process_specific_stage_content.process_technical_specific_stage_content_id,
          type: RequestType.cultivate_process_content,
        },
      });
      if (!request_exist) {
        // Create a new request
        const new_request = await this.requestRepo.save({
          process_technical_specific_stage_content_id:
            process_specific_stage_content.process_technical_specific_stage_content_id,
          time_start: getTimeByPlusDays(getDateWithoutTime(new Date()), 1),
          type: RequestType.cultivate_process_content,
          status: RequestStatus.assigned,
        });
        // create task for the request
        await this.taskService.createTaskAuto(
          new_request.request_id,
          process_specific_stage_content.process_technical_specific_stage.process_technical_specific
            .expert_id,
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
        // log
        this.logger.log(
          `New request cultivate process content created for ${process_specific_stage_content.process_technical_specific_stage_content_id}`,
        );
      }
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }

  /**
   * Create request report booking material call when booking material is expired
   * @function createRequestReportBookingMaterial
   * @param booking_material_id
   */

  async createRequestReportBookingMaterial(booking_material_id: string): Promise<void> {
    try {
      // create a new request
      const new_request = await this.requestRepo.save({
        booking_material_id,
        type: RequestType.report_booking_material,
      });
      // create task for the request
      await this.taskService.createTask(new_request.request_id);
      // log
      this.loggerService.log(
        `New request report booking material created for ${booking_material_id}`,
      );
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }
  /**
   * Create request report service specific call when service specific is expired
   * @param service_specific_id
   */

  async createRequestReportServiceSpecific(service_specific_id: string): Promise<void> {
    try {
      // create a new request
      const new_request = await this.requestRepo.save({
        service_specific_id,
        type: RequestType.report_service_specific,
      });
      // create task for the request
      await this.taskService.createTask(new_request.request_id);
      // log
      this.loggerService.log(
        `New request report service specific created for ${service_specific_id}`,
      );
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
    }
  }
}
