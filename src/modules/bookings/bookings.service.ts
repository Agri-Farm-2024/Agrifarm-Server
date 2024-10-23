import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookingService } from './interfaces/IBookingService.interface';
import { LandsService } from '../lands/lands.service';
import { Land } from '../lands/entities/land.entity';
import { LandStatus } from '../lands/types/land-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookindLand } from './entities/bookindLand.entity';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { BookingStatus } from './types/booking-status.enum';
import { Payload } from '../auths/types/payload.type';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusBookingDTO } from './dto/update-status-booking.dto';

@Injectable()
export class BookingsService implements IBookingService {
  constructor(
    @InjectRepository(BookindLand)
    private readonly bookingEntity: Repository<BookindLand>,

    private readonly landService: LandsService,
  ) {}

  /**
   * @function createBooking
   * @param createBookingDto
   *
   * @returns
   */
  async createBooking(
    createBookingDto: CreateBookingDto,
    land_renter: Payload,
  ): Promise<any> {
    try {
      // check land status is free
      const land: Land = await this.landService.getDetailLandById(
        createBookingDto.land_id,
      );
      if (land.status !== LandStatus.free) {
        throw new BadRequestException('Land is not free to book');
      }
      // Get price per month of land
      const total_price =
        land.price_booking_per_month * createBookingDto.total_month;
      // create time end booking equal time_start + total_month
      const time_end = new Date(createBookingDto.time_start);
      time_end.setMonth(time_end.getMonth() + createBookingDto.total_month);
      // check if already have booking in this time and status != pending and != reject
      const booking_exist = await this.bookingEntity.find({
        where: {
          land_id: createBookingDto.land_id,
          status: Not(In([BookingStatus.pending, BookingStatus.rejected])),
          time_end: LessThanOrEqual(createBookingDto.time_start),
        },
      });
      if (booking_exist.length > 0) {
        throw new BadRequestException('Land is already booked');
      }
      // create new booking
      const new_booking = await this.bookingEntity.save({
        ...createBookingDto,
        landrenter_id: land_renter.user_id,
        price_per_month: Math.floor(land.price_booking_per_month),
        time_end: time_end,
        staff_id: land.staff_id,
        total_price: total_price,
        price_deposit: total_price * 0.1,
      });
      // send notification to staff and land renter
      // create mail confirm for land renter
      // update land status to booked
      await this.landService.updateLandStatus(land.land_id, LandStatus.booked);
      return new_booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function getListBooking
   * @param user
   */

  async getListBookingStrategy(user: Payload): Promise<any> {
    try {
      const getListBookingStrategy = {
        [UserRole.admin]: this.getAllBooking.bind(this),
        [UserRole.manager]: this.getAllBooking.bind(this),
        [UserRole.staff]: this.getALLBookingByStaff.bind(this),
        [UserRole.land_renter]: this.getALLBookingByLandrenter.bind(this),
      };

      return await getListBookingStrategy[user.role](user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getAllBooking(user: any): Promise<any> {
    try {
      const bookings = await this.bookingEntity.find({
        relations: {
          land: true,
          land_renter: true,
          staff: true,
        },
      });
      return bookings;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getALLBookingByStaff(user: any): Promise<any> {
    try {
      const bookings = await this.bookingEntity.find({
        where: {
          staff_id: user.id,
        },
        relations: {
          land: true,
          land_renter: true,
          staff: true,
        },
      });
      return bookings;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getALLBookingByLandrenter(user: any): Promise<any> {
    try {
      const bookings = await this.bookingEntity.find({
        where: {
          landrenter_id: user.id,
        },
        relations: {
          land: true,
          land_renter: true,
          staff: true,
        },
      });
      return bookings;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function getDetailBooking
   * @param bookingId
   */

  async getBookingDetail(bookingId: string): Promise<any> {
    try {
      // get booking detail
      const booking = await this.bookingEntity.findOne({
        where: {
          booking_id: bookingId,
        },
        relations: {
          land: true,
          land_renter: true,
          staff: true,
        },
        select: {
          land_renter: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
          },
          staff: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      });
      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
      return booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusBooking
   * @param bookingId
   *
   * @returns
   */

  async updateStatusBookingStrategy(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // check booking exist
      const booking_exist = await this.bookingEntity.findOne({
        where: {
          booking_id: bookingId,
        },
      });
      if (!booking_exist) {
        throw new BadRequestException('Booking not found');
      }
      // return strategy
      const updateStatusBookingStrategy = {
        [BookingStatus.pending_sign]: this.updateStatusToPendingSigṇ.bind(this),
      };
      return await updateStatusBookingStrategy[data.status](
        booking_exist,
        data,
        user,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private async updateStatusToPendingSigṇ(
    booking_exist: any,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // check user update is staff
      if (user.role !== UserRole.staff) {
        throw new BadRequestException('You are not staff');
      }
      // check booking status is pending
      if (booking_exist.status !== BookingStatus.pending) {
        throw new BadRequestException('Booking is not pending');
      }
      // check is schedule booking
      if (data.is_schedule) {
        // send mail confirm to land renter
        booking_exist.is_schedule = true;
      }
      // update status booking to pending sign
      booking_exist.status = data.status;
      // update booking
      await this.bookingEntity.save(booking_exist);
      return booking_exist;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
