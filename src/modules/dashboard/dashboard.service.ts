import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RequestsService } from '../requests/requests.service';
import { BookingsService } from '../bookings/bookings.service';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { UserRole } from '../users/types/user-role.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { LandsService } from '../lands/lands.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(
    private readonly userService: UsersService,

    private readonly requestService: RequestsService,

    private readonly bookingLandService: BookingsService,

    private readonly servicePackageService: ServicesService,

    private readonly transactionService: TransactionsService,

    private readonly landService: LandsService,

    private readonly orderService: OrdersService,
  ) {}

  async getDashboardData(): Promise<any> {
    try {
      // get data
      const [
        users,
        requests,
        bookings,
        services,
        revenue,
        lands,
        orders_material,
        service_packages,
      ] = await Promise.all([
        this.userService.getListUserByRole(UserRole.land_renter),
        this.requestService.getAllRequestForDashbaoard(),
        this.bookingLandService.getBookingsForDashboard(),
        this.servicePackageService.getServiceForDashboard(),
        this.transactionService.getRevenueForDashboard(),
        this.landService.getLandForDashboard(),
        this.orderService.getOrderForDashboard(),
        this.servicePackageService.getServicePackageForDashboard(),
      ]);
      return {
        landrenter: {
          total: users.length,
        },
        requests,
        bookings,
        services,
        revenue,
        lands,
        orders_material,
        service_packages,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
