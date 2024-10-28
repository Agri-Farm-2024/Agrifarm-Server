import {
  BadRequestException,
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

@Injectable()
export class ServicesService implements IService {
  constructor(
    @InjectRepository(ServicePackage)
    private readonly servicePackageEntity: Repository<ServicePackage>,

    @InjectRepository(ServiceSpecific)
    private readonly serviceSpecificEntity: Repository<ServiceSpecific>,

    private readonly PlantsService: PlantsService,
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
      const service_package_exist = await this.servicePackageEntity.findOne({
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
      const new_service_package = await this.servicePackageEntity.save({
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
      const service_packages = await this.servicePackageEntity.find();
      return service_packages;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
  ): Promise<any> {
    try {
      // check if the service package exists
      const service_package = await this.servicePackageEntity.findOne({
        where: {
          service_package_id: createServicePackage.service_package_id,
        },
      });
      if (!service_package) {
        throw new BadRequestException('Service package does not exist');
      }
      // get detail plant season
      const plant_season = await this.PlantsService.getDetailPlantSeason(
        createServicePackage.plant_season_id,
      );
      //
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
