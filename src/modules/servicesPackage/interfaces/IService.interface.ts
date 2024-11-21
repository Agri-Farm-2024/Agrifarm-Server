import { Payload } from 'src/modules/auths/types/payload.type';
import { CreateServicePackageDTO } from '../dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from '../dto/create-service-specific.dto';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ServiceSpecificStatus } from '../types/service-specific-status.enum';

export interface IService {
  createServicePackage(
    createServicePackage: CreateServicePackageDTO,
  ): Promise<any>;

  getListServicePackages(): Promise<any>;

  buyServiceSpecific(
    createServicePackage: CreateServiceSpecificDTO,
    user: Payload,
  ): Promise<any>;

  getDetailServiceSpecific(service_specific_id: string): Promise<any>;

  getDetailServicePackage(service_package_id: string): Promise<any>

  deleteServicePackage(service_package_id: string): Promise<any>;

  checkServiceIsExpired(): Promise<any>;

  cancelServiceSpecific(service_specific_id: string): Promise<any>;

  handlePaymentServiceSpecificSuccess(
    transaction: Transaction,
  ): Promise<any>;

  getListServiceSpecific(
    pagination: PaginationParams,
    user: Payload,
    status: ServiceSpecificStatus,
  ): Promise<any>;

  getListServicePackages(): Promise<any>;

  

}
