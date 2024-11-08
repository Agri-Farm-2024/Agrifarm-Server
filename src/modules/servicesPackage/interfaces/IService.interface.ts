import { CreateServicePackageDTO } from '../dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from '../dto/create-service-specific.dto';

export interface IService {
  createServicePackage(
    createServicePackage: CreateServicePackageDTO,
  ): Promise<any>;

  getListServicePackages(): Promise<any>;

  buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
  ): Promise<any>;
}
