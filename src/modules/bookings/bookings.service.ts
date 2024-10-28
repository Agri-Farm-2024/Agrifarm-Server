import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookingService } from './interfaces/IBookingService.interface';
import { LandsService } from '../lands/lands.service';
import { Land } from '../lands/entities/land.entity';
import { LandStatus } from '../lands/types/land-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingLand } from './entities/bookingLand.entity';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { BookingStatus } from './types/booking-status.enum';
import { Payload } from '../auths/types/payload.type';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusBookingDTO } from './dto/update-status-booking.dto';
import { MailService } from 'src/mails/mail.service';

@Injectable()
export class BookingsService implements IBookingService {
  constructor(
    @InjectRepository(BookingLand)
    private readonly bookingEntity: Repository<BookingLand>,

    private readonly landService: LandsService,

    private readonly mailService: MailService,
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

  async getAllBooking(user: any): Promise<any> {
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

  async getALLBookingByStaff(user: any): Promise<any> {
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
        [BookingStatus.pending_sign]: this.updateStatusToPendingSign.bind(this),
        [BookingStatus.pending_contract]:
          this.updateStatusToPendingContract.bind(this),
        [BookingStatus.pending_payment]:
          this.updateStatusToPendingPayment.bind(this),
        [BookingStatus.completed]: this.updateStatusToCompleted.bind(this),
        [BookingStatus.expired]: this.updateStatusToExpired.bind(this),
        [BookingStatus.canceled]: this.updateStatusToCanceled.bind(this),
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

  /**
   * @function updateStatusToPendingContract
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToPendingContract(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // Check status booking is pending
      if (booking_exist.status !== BookingStatus.pending) {
        throw new BadRequestException('Status booking is not pending');
      }
      // Check user is staff
      if (user.role !== UserRole.staff) {
        throw new ForbiddenException('User is not staff');
      }
      // get detail land
      const land_exist: Land = await this.landService.getDetailLandById(
        booking_exist.land_id,
      );
      // Check staff is match with land staff
      if (land_exist.staff_id !== user.user_id) {
        throw new ForbiddenException('You are not staff of this land');
      }
      // Check is schedule
      if (data.is_schedule === true) {
        // Send mail to land renter and make expred schedule after 48h
        // await this.mailService.sendMailConfirmBooking(booking_exist);
        const update_booking = await this.bookingEntity.save({
          ...booking_exist,
          status: BookingStatus.pending_contract,
          is_schedule: data.is_schedule,
          expired_schedule_at: new Date(
            new Date().getTime() + 48 * 60 * 60 * 1000,
          ),
        });
        return update_booking;
      }
      // update status booking to pending contract
      const update_booking = await this.bookingEntity.save({
        ...booking_exist,
        status: BookingStatus.pending_contract,
      });
      return update_booking;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusToPendingSigṇ
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToPendingSign(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // Check user is manager
      if (user.role !== UserRole.manager) {
        throw new ForbiddenException('You are not manager');
      }
      // Check status booking is pending contract
      if (booking_exist.status !== BookingStatus.pending_contract) {
        throw new BadRequestException('Status booking is not pending contract');
      }
      // update status booking to pending sign
      const update_booking = await this.bookingEntity.save({
        ...booking_exist,
        status: BookingStatus.pending_sign,
      });
      return update_booking;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusToPendingSigṇ
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToPendingPayment(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // Check status booking is pending
      if (booking_exist.status !== BookingStatus.pending_sign) {
        throw new BadRequestException('Status booking is not pending sign');
      }
      // Check user is staff
      if (user.role !== UserRole.staff) {
        throw new ForbiddenException('User is not staff');
      }
      // get detail land
      const land_exist: Land = await this.landService.getDetailLandById(
        booking_exist.land_id,
      );
      // Check staff is match with land staff
      if (land_exist.staff_id !== user.user_id) {
        throw new ForbiddenException('You are not staff of this land');
      }
      // Check data have contract image
      if (!data.contract_image) {
        throw new BadRequestException('Contract image is required');
      }
      // Create transaction for payment
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusToCompleted
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToCompleted(
    booking_exist: any,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    return 'updateStatusToPendingPayment';
  }

  /**
   * @function updateStatusToExpired
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToExpired(
    booking_exist: any,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    return 'updateStatusToPendingPayment';
  }

  /**
   * @function updateStatusToCanceled
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToCanceled(
    booking_exist: any,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    return 'updateStatusToPendingPayment';
  }
}
