import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { getTimeByPlusMonths } from 'src/utils/time.utl';
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
import { Payload } from '../auths/types/payload.type';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../users/types/user-role.enum';

@Injectable()
export class ServicesService implements IService {
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
  ) {}

  /**
   * @function createServicePackage
   * @param createServicePackageDTO
   */
  async createServicePackage(
    createServicePackageDTO: CreateServicePackageDTO,
  ): Promise<any> {
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
    user: Payload,
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

  async buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // get booking detail
      const booking_detail: BookingLand =
        await this.bookingLandService.getBookingDetail(
          createServicePackage.booking_id,
        );

      if (
        createServicePackage.acreage_land > booking_detail.land.acreage_land
      ) {
        throw new BadRequestException('Acreage land is not enough');
      }
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
      const plant_season: PlantSeason =
        await this.PlantsService.getDetailPlantSeason(
          createServicePackage.plant_season_id,
        );

      // check if the plant season is active
      if (plant_season.status !== PlantSeasonStatus.active) {
        throw new BadRequestException('Plant season is not applying');
      }
      if (!plant_season.process_technical_standard) {
        throw new BadRequestException(
          'Plant season does not have a technical standard process',
        );
      }
      if (
        plant_season.process_technical_standard.status !==
        ProcessTechnicalStandardStatus.accepted
      ) {
        throw new BadRequestException(
          'Process standard is not accepted for this plant season',
        );
      }
      // check time is valid with booking
      if (
        booking_detail.time_end <
        getTimeByPlusMonths(
          createServicePackage.time_start,
          plant_season.total_month,
        )
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
      if (
        total_acreage + createServicePackage.acreage_land >
        booking_detail.land.acreage_land
      ) {
        throw new BadRequestException(
          `Acreage land is not enough. You still have ${booking_detail.land.acreage_land - total_acreage} acreage land`,
        );
      }
      // create a new service specific
      const new_service_specific = await this.serviceSpecificRepo.save({
        ...createServicePackage,
        price_process: plant_season.price_process,
        price_package: service_package.price,
        time_end: getTimeByPlusMonths(
          createServicePackage.time_start,
          plant_season.total_month,
        ),
        landrenter_id: user.user_id,
      });
      const total_price =
        (new_service_specific.price_package +
          new_service_specific.price_process) *
        (new_service_specific.acreage_land / 1000);
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
          booking_land: true,
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

  async handlePaymentServiceSpecificSuccess(
    transaction: Transaction,
  ): Promise<any> {
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
        throw new BadRequestException(
          'Service specific is not pending payment',
        );
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

  async cancelServiceSpecific(service_specific_id: string): Promise<any> {
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
      // delete service specific
      await this.serviceSpecificRepo.delete(
        service_specific.service_specific_id,
      );
      return 'Cancel service specific successfully';
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

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
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update service package for manager upload contract image
   * @function updateToUsedServiceSpecific
   * @param service_specific_id
   * @param updateServicePackageDTO
   */

  async updateToUsedServiceSpecific(
    service_specific_id: string,
    contract_image: string,
  ): Promise<any> {
    try {
      // get detail service specific
      const service_specific = await this.serviceSpecificRepo.findOne({
        where: {
          service_specific_id,
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
      service_specific.status = ServiceSpecificStatus.used;
      const new_service = await this.serviceSpecificRepo.save(service_specific);
      // create process specific
      await this.processService.createProcessSpecific(service_specific);
      // send email to user
      // send notification to user
      return new_service;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
