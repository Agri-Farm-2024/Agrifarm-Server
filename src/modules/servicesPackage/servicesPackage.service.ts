import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IService } from './interfaces/IService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ServicePackage } from './entities/servicePackage.entity';
import { LessThan, Not, Repository } from 'typeorm';
import { ServiceSpecific } from './entities/serviceSpecific.entity';
import { CreateServicePackageDTO } from './dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from './dto/create-service-specific.dto';
import { PlantsService } from '../plants/plants.service';
import { PlantSeason } from '../plants/entities/plantSeason.entity';
import { getDateWithoutTime, getTimeByPlusDays, getTimeByPlusMonths } from 'src/utils/time.utl';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { ServiceSpecificStatus } from './types/service-specific-status.enum';
import { PlantSeasonStatus } from '../plants/types/plant-season-status.enum';
import { ProcessTechnicalStandardStatus } from '../processes/types/status-processStandard.enum';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ProcessesService } from '../processes/processes.service';
import { ServicePackageStatus } from './types/service-package-status.enum';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { IUser } from '../auths/interfaces/IUser.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../users/types/user-role.enum';
import { RequestsService } from '../requests/requests.service';
import { updateServicePackageDTO } from './dto/update-service-package.dto';
import { Request } from '../requests/entities/request.entity';
import { LoggerService } from 'src/logger/logger.service';
import { ExtendStatus } from '../extends/types/extend-status.enum';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { convertArrayToContractfile } from 'src/utils/link.util';

@Injectable()
export class ServicesService implements IService {
  private readonly logger = new Logger(ServicesService.name);
  constructor(
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepo: Repository<ServicePackage>,

    @InjectRepository(ServiceSpecific)
    private readonly serviceSpecificRepo: Repository<ServiceSpecific>,

    private readonly PlantsService: PlantsService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,

    @Inject(forwardRef(() => ProcessesService))
    private readonly processService: ProcessesService,

    @Inject(forwardRef(() => BookingsService))
    private readonly bookingLandService: BookingsService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,

    private readonly loggerService: LoggerService,

    private readonly mailService: MailService,
  ) {}

  /**
   * @function createServicePackage
   * @param createServicePackageDTO
   */
  async createServicePackage(createServicePackageDTO: CreateServicePackageDTO): Promise<any> {
    try {
      // check if the service package already exists
      const service_package_exist = await this.servicePackageRepo.findOne({
        where: {
          process_of_plant: createServicePackageDTO.process_of_plant,
          material: createServicePackageDTO.material,
          purchase: createServicePackageDTO.purchase,
        },
      });
      if (service_package_exist) {
        throw new BadRequestException('Service package already exists');
      }
      // create a new service package
      const new_service_package = await this.servicePackageRepo.save({
        ...createServicePackageDTO,
      });
      return new_service_package;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function getListServicePackages
   * @returns
   */
  async getListServicePackages(): Promise<any> {
    try {
      const service_packages = await this.servicePackageRepo.find();
      return service_packages;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function getListServiceSpecific
   * @returns
   */
  async getListServiceSpecific(
    pagination: PaginationParams,
    user: IUser,
    status: ServiceSpecificStatus,
  ): Promise<any> {
    try {
      const filter: any = {};

      if (user.role === UserRole.land_renter) {
        filter.landrenter_id = user.user_id;
      }

      if (user.role === UserRole.staff) {
        filter.booking_land = {
          staff_id: user.user_id,
        };
      }

      if (status) {
        filter.status = status;
      }
      const [services, total_count] = await Promise.all([
        this.serviceSpecificRepo.find({
          relations: {
            land_renter: true,
            plant_season: {
              plant: true,
            },
            booking_land: {
              land: true,
            },
            process_technical_specific: {
              expert: true,
            },
            service_package: true,
          },
          order: {
            updated_at: 'DESC',
          },
          where: filter,
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.serviceSpecificRepo.count({
          where: filter,
        }),
      ]);
      // total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        services,
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
   *  Buy service specific
   * @param createServicePackage
   * @param user
   * @returns
   */

  async buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
    user: IUser,
  ): Promise<any> {
    try {
      // check if the service package exists
      const service_package = await this.servicePackageRepo.findOne({
        where: {
          service_package_id: createServicePackage.service_package_id,
        },
      });
      if (!service_package) {
        throw new BadRequestException('Service package does not exist');
      }
      // get detail plant season
      const plant_season: PlantSeason = await this.PlantsService.getDetailPlantSeason(
        createServicePackage.plant_season_id,
      );

      // check if the plant season is active
      if (plant_season.status !== PlantSeasonStatus.active) {
        throw new BadRequestException('Plant season is not applying');
      }
      // check if the plant season has a technical standard process
      if (!plant_season.process_technical_standard) {
        throw new BadRequestException('Plant season does not have a technical standard process');
      }
      // check if the technical standard process is accepted
      if (
        plant_season.process_technical_standard.status !== ProcessTechnicalStandardStatus.accepted
      ) {
        throw new BadRequestException('Process standard is not accepted for this plant season');
      }
      // get detail booking
      const booking_detail: BookingLand = await this.bookingLandService.getBookingDetail(
        createServicePackage.booking_id,
      );
      // map booking extends
      booking_detail.extends.map((extend) => {
        if (extend.status === ExtendStatus.completed) {
          booking_detail.time_end = getTimeByPlusMonths(
            booking_detail.time_end,
            extend.total_month,
          );
        }
      });
      // check time is valid with booking
      if (
        booking_detail.time_end <
        getTimeByPlusMonths(createServicePackage.time_start, plant_season.total_month)
      ) {
        throw new BadRequestException(
          `Time is not valid with booking expired in ${booking_detail.time_end.toLocaleDateString()}`,
        );
      }
      // get list service by this booking for acreage land
      const list_service_specific = await this.serviceSpecificRepo.find({
        where: {
          booking_id: createServicePackage.booking_id,
          status: Not(ServiceSpecificStatus.expired),
        },
      });
      let total_acreage = 0;
      list_service_specific.forEach((service) => {
        total_acreage += service.acreage_land;
      });
      if (total_acreage + createServicePackage.acreage_land > booking_detail.land.acreage_land) {
        throw new BadRequestException(
          `Acreage land is not enough. You still have ${booking_detail.land.acreage_land - total_acreage} acreage land`,
        );
      }
      // convert time_start
      createServicePackage.time_start = getDateWithoutTime(createServicePackage.time_start);
      // create a new service specific
      const new_service_specific = await this.serviceSpecificRepo.save({
        ...createServicePackage,
        price_process: plant_season.price_process,
        price_package: service_package.price,
        time_end: getTimeByPlusMonths(createServicePackage.time_start, plant_season.total_month),
        landrenter_id: user.user_id,
        price_purchase_per_kg: plant_season.price_purchase_per_kg,
      });
      // calculate total price
      const total_price = this.caculateTotalPriceServiceSpecific(
        new_service_specific.price_package,
        new_service_specific.price_process,
        new_service_specific.acreage_land,
      );

      // create transaction DTO and create transaction
      const transactionData: Partial<CreateTransactionDTO> = {
        service_specific_id: new_service_specific.service_specific_id,
        total_price: total_price,
        purpose: TransactionPurpose.service,
        user_id: user.user_id,
      };

      const transaction = await this.transactionService.createTransaction(
        transactionData as CreateTransactionDTO,
      );
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailServiceSpecific(service_specific_id: string): Promise<any> {
    try {
      const service_specific = await this.serviceSpecificRepo.findOne({
        where: {
          service_specific_id: service_specific_id,
        },
        relations: {
          service_package: true,
          process_technical_specific: true,
          booking_land: {
            land: true,
          },
        },
      });
      if (!service_specific) {
        throw new BadRequestException('Service specific does not exist');
      }

      return service_specific;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //get detail service package
  async getDetailServicePackage(service_package_id: string): Promise<any> {
    try {
      const service_package = await this.servicePackageRepo.findOne({
        where: {
          service_package_id,
        },
      });
      if (!service_package) {
        throw new BadRequestException('Service package does not exist');
      }

      return service_package;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async handlePaymentServiceSpecificSuccess(transaction: Transaction): Promise<any> {
    try {
      // get detail service specific
      const service_specific = await this.serviceSpecificRepo.findOne({
        where: {
          service_specific_id: transaction.service_specific_id,
        },
      });
      if (!service_specific) {
        throw new BadRequestException('Service specific does not exist');
      }
      // check default status
      if (service_specific.status !== ServiceSpecificStatus.pending_payment) {
        throw new BadRequestException('Service specific is not pending payment');
      }
      // update service specific status
      await this.serviceSpecificRepo.update(
        {
          service_specific_id: transaction.service_specific_id,
        },
        {
          status: ServiceSpecificStatus.pending_sign,
        },
      );
      // // create process specific
      // await this.processService.createProcessSpecific(service_specific);
      // send email to user
      // send notification to user
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //delete service package
  async deleteServicePackage(service_package_id: string): Promise<any> {
    try {
      // CHeck if the service package is used
      const service_specific_used = await this.serviceSpecificRepo.findOne({
        where: {
          service_package: {
            service_package_id,
          },
          status: ServiceSpecificStatus.used,
        },
      });
      if (service_specific_used) {
        throw new BadRequestException('Service package is used');
      }
      // check if the service package exists
      const service_package = await this.servicePackageRepo.findOne({
        where: {
          service_package_id,
        },
      });
      if (!service_package) {
        throw new BadRequestException('Service package does not exist');
      }
      service_package.status = ServicePackageStatus.inactive;
      await this.servicePackageRepo.save(service_package);
      return 'Delete service package successfully';
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteServiceSpecific(service_specific_id: string): Promise<string> {
    try {
      // get detail
      const service_specific = await this.serviceSpecificRepo.findOne({
        where: {
          service_specific_id,
        },
      });
      if (!service_specific) {
        throw new BadRequestException('Service specific does not exist');
      }
      if (service_specific.status !== ServiceSpecificStatus.pending_payment) {
        throw new BadRequestException('Service specific is not pending payment');
      }
      // delete service specific
      await this.serviceSpecificRepo.delete(service_specific.service_specific_id);
      // log
      this.loggerService.log(`Service specific ${service_specific_id} is deleted`);
      this.logger.log(`Service specific ${service_specific_id} is deleted`);

      return 'Delete service specific successfully';
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Check service is expired call by cron job
   * @function checkServiceIsExpired
   */

  async checkServiceIsExpired(): Promise<any> {
    try {
      // get all service specific
      const service_specifics = await this.serviceSpecificRepo.find({
        where: {
          status: ServiceSpecificStatus.used,
          time_end: LessThan(new Date()),
        },
      });
      service_specifics.forEach(async (service_specific) => {
        // update status service specific
        await this.serviceSpecificRepo.update(
          {
            service_specific_id: service_specific.service_specific_id,
          },
          {
            status: ServiceSpecificStatus.expired,
          },
        );
        // Create request report this service specific
        await this.requestService.createRequestReportServiceSpecific(
          service_specific.service_specific_id,
        );
      });
    } catch (error) {
      this.logger.error(`Error when check service is expired ${error.message}`);
    }
  }

  /**
   * Update service package for manager upload contract image
   * @function updateServiceSpecificToUsed
   * @param service_specific_id
   * @param updateServicePackageDTO
   */

  async updateServiceSpecificToUsed(
    service_specific_id: string,
    contract_image: string,
  ): Promise<any> {
    try {
      // get detail service specific
      const service_specific = await this.serviceSpecificRepo.findOne({
        where: {
          service_specific_id,
        },
        relations: {
          booking_land: {
            land: true,
          },
          land_renter: true,
          plant_season: {
            plant: true,
          },
          service_package: true,
        },
      });
      if (!service_specific) {
        throw new BadRequestException('Service specific does not exist');
      }
      // check default status
      if (service_specific.status !== ServiceSpecificStatus.pending_sign) {
        throw new BadRequestException('Service specific is not pending sign');
      }
      // update contract image
      service_specific.contract_image = contract_image;
      const new_service = await this.serviceSpecificRepo.update(
        {
          service_specific_id,
        },
        {
          status: ServiceSpecificStatus.used,
          contract_image,
        },
      );
      // // create process specific
      await this.processService.createProcessSpecific(service_specific);
      // convert contract image
      const contract_path = convertArrayToContractfile(contract_image);
      // send email to user
      await this.mailService.sendMail(
        service_specific.land_renter.email,
        SubjectMailEnum.buyService,
        TemplateMailEnum.buyService,
        {
          is_buy: true,
          full_name: service_specific.land_renter.full_name,
          service_description: service_specific.service_package.description,
          plant: service_specific.plant_season.plant.name,
          land_name: service_specific.booking_land.land.name,
          time_start: service_specific.time_start,
          time_end: service_specific.time_end,
          total_price: this.caculateTotalPriceServiceSpecific(
            service_specific.price_package,
            service_specific.price_process,
            service_specific.acreage_land,
          ),
          status: 'Đã ký tên',
          user_mail: service_specific.land_renter.email,
        },
        contract_path,
      );
      // send notification to user
      return new_service;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Check and create purchase product service call by cron job
   * @function checkAndCreatePurchaseProductService
   * @returns
   */

  async checkAndCreatePurchaseProductService(): Promise<any> {
    try {
      // get date only day month year
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      const list_service = await this.serviceSpecificRepo.find({
        where: {
          status: ServiceSpecificStatus.used,
          service_package: {
            purchase: true,
            process_of_plant: true,
          },
          time_end: getTimeByPlusDays(date, 7),
        },
      });
      if (list_service.length > 0) {
        // create request
        for (const service of list_service) {
          await this.requestService.createRequestPurchase({
            service_specific_id: service.service_specific_id,
          });
        }
      }
      return list_service;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update service package
   * @param service_package_id
   * @param data
   * @returns
   */

  async updateServicePackage(
    service_package_id: string,
    data: updateServicePackageDTO,
  ): Promise<any> {
    try {
      // check exist
      const service_package = await this.servicePackageRepo.findOne({
        where: {
          service_package_id,
        },
      });
      if (!service_package) {
        throw new BadRequestException('Service package does not exist');
      }
      this.loggerService.log(`Service package ${service_package_id} is updated`);
      // update service package
      return await this.servicePackageRepo.save({
        ...service_package,
        ...data,
      });
    } catch (error) {
      this.loggerService.error(`Error when update service package ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get service for dashboard
   * @function getServiceForDashboard
   * @returns
   */

  async getServiceForDashboard(): Promise<any> {
    try {
      const [total, total_completed] = await Promise.all([
        this.serviceSpecificRepo.count(),
        this.serviceSpecificRepo.count({
          where: {
            status: ServiceSpecificStatus.used,
          },
        }),
      ]);
      return {
        total,
        total_used: total_completed,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get service for dashboard
   * @function getServicePackageForDashboard
   * @returns
   */

  async getServicePackageForDashboard(): Promise<any> {
    try {
      const services = await this.serviceSpecificRepo.find({
        where: {
          status: ServiceSpecificStatus.used,
        },
        relations: {
          service_package: true,
        },
      });
      // reduces
      const servie_package = services.reduce((acc, service): any => {
        if (!acc[service.service_package.name]) {
          acc[service.service_package.name] = {
            total_buy: 0,
          };
        }
        acc[service.service_package.name].total_buy += 1;
        return acc;
      }, {});
      return servie_package;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get service for dashboard
   * @function createRefundTransactionServiceSpecific
   * @param request
   * @returns
   */

  async createRefundTransactionServiceSpecific(request: Request): Promise<any> {
    try {
      // Define price for deposit
      const price_for_deposit =
        (request.service_specific.price_package + request.service_specific.price_process) *
        (request.service_specific.acreage_land / 1000) *
        0.1;
      // create transaction DTO and create transaction for refund deposit
      const transactionData: Partial<CreateTransactionDTO> = {
        service_specific_id: request.service_specific.service_specific_id,
        total_price: price_for_deposit * request.task.report.quality_report,
        purpose: TransactionPurpose.report_service_specific,
        user_id: request.service_specific.landrenter_id,
      };
      const transaction = await this.transactionService.createTransaction(
        transactionData as CreateTransactionDTO,
      );
      // send notification to user
      return transaction;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private caculateTotalPriceServiceSpecific(
    price_package: number,
    price_process: number,
    acreage_land: number,
  ) {
    return (price_package + price_process) * (acreage_land / 1000);
  }
}
