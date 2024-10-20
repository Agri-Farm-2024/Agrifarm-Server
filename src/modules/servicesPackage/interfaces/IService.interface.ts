import { CreateServicePackageDTO } from '../dto/create-service-package.dto';

export interface IService {
  createServicePackage(
    createServicePackage: CreateServicePackageDTO,
  ): Promise<any>;

  getListServicePackages(): Promise<any>;
}
