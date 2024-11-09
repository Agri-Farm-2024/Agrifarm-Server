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
import { Repository } from 'typeorm';
import { ServiceSpecific } from './entities/serviceSpecific.entity';
import { CreateServicePackageDTO } from './dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from './dto/create-service-specific.dto';
import { PlantsService } from '../plants/plants.service';
import { PlantSeason } from '../plants/entities/plantSeason.entity';
import { getTimeByPlusDays } from 'src/utils/time.utl';
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

@Injectable()
export class ServicesService implements IService {
  constructor(
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepo: Repository<ServicePackage>,

    @InjectRepository(ServiceSpecific)
    private readonly serviceSpecificRepo: Repository<ServiceSpecific>,

    private readonly PlantsService: PlantsService,

    private readonly transactionService: TransactionsService,

    @Inject(forwardRef(() => ProcessesService))
    private readonly processService: ProcessesService,

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

  async buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
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
      // // check time is valid
      // const total_month_booking =
      //   new Date(booking_detail.time_end).getMonth() -
      //   new Date(booking_detail.time_start).getMonth() +
      //   (new Date(booking_detail.time_end).getDay() -
      //     new Date(booking_detail.time_start).getDay()) /
      //     30;

      // if (total_month_booking < plant_season.total_month) {
      //   throw new BadRequestException(
      //     'The time of booking is not enough for this plant season',
      //   );
      // }
      // create a new service specific
      const new_service_specific = await this.serviceSpecificRepo.save({
        ...createServicePackage,
        price_process: plant_season.price_process,
        price_package: service_package.price,
        time_end: getTimeByPlusDays(
          createServicePackage.time_start,
          plant_season.total_month,
        ),
      });
      // create transaction DTO and create transaction
      const transactionData: Partial<CreateTransactionDTO> = {
        service_specific_id: new_service_specific.service_specific_id,
        total_price:
          new_service_specific.price_package +
          new_service_specific.price_process,
        purpose: TransactionPurpose.service,
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
          service_specific_id,
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
      // update service specific status
      await this.serviceSpecificRepo.update(
        {
          service_specific_id: transaction.service_specific_id,
        },
        {
          status: ServiceSpecificStatus.used,
        },
      );
      // create process specific
      await this.processService.createProcessSpecific(service_specific);
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
}
