import { IUser } from 'src/modules/auths/interfaces/IUser.interface';
import { CreateServicePackageDTO } from '../dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from '../dto/create-service-specific.dto';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ServiceSpecificStatus } from '../types/service-specific-status.enum';

export interface IService {
  createServicePackage(createServicePackage: CreateServicePackageDTO): Promise<any>;

  getListServicePackages(): Promise<any>;

  buyServiceSpecific(createServicePackage: CreateServiceSpecificDTO, user: IUser): Promise<any>;

  getDetailServiceSpecific(service_specific_id: string): Promise<any>;

  getDetailServicePackage(service_package_id: string): Promise<any>;

  handlePaymentServiceSpecificSuccess(transaction: Transaction): Promise<any>;

  deleteServicePackage(service_package_id: string): Promise<any>;

  deleteServiceSpecific(service_specific_id: string): Promise<any>;

  getListServiceSpecific(
    pagination: PaginationParams,
    user: IUser,
    status: ServiceSpecificStatus,
  ): Promise<any>;

  getListServicePackages(): Promise<any>;

  checkServiceIsExpired(): Promise<any>;

  updateServiceSpecificToUsed(service_specific_id: string, contract_image: string): Promise<any>;

  checkAndCreatePurchaseProductService(): Promise<any>;

  getServiceForDashboard(): Promise<any>;
}
