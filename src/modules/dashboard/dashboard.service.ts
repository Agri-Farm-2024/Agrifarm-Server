import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RequestsService } from '../requests/requests.service';
import { BookingsService } from '../bookings/bookings.service';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { UserRole } from '../users/types/user-role.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UsersService,

    private readonly requestService: RequestsService,

    private readonly bookingLandService: BookingsService,

    private readonly servicePackageService: ServicesService,
  ) {}

  async getDashboardData(): Promise<any> {
    try {
      // get data
      const [users, requests, bookings, services] = await Promise.all([
        this.userService.getListUserByRole(UserRole.land_renter),
        this.requestService.getAllRequestForDashbaoard(),
        this.bookingLandService.getBookingsForDashboard(),
        this.bookingLandService.getBookingsForDashboard(),
      ]);
      return {
        users: {
          total: users.length,
          data: users,
        },
        requests,
        bookings,
        services,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
