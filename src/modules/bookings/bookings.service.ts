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
import { BookingPaymentFrequency } from './types/booking-payment.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

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
      // Get detail land
      const land: Land = await this.landService.getDetailLandById(
        createBookingDto.land_id,
      );
      //  Check if land is free
      if (land.status !== LandStatus.free) {
        throw new BadRequestException('Land is not free to book');
      }
      // Check land has staff is active
      if (!land.staff_id) {
        throw new BadRequestException('Wait for manager assign staff to land');
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
        price_deposit: land.price_booking_per_month * 2,
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

  async getListBookingStrategy(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      if (type !== 'booking' && type !== 'request') {
        throw new BadRequestException('Type is invalid');
      }

      const getListBookingStrategy = {
        [UserRole.manager]: this.getListBookingByManager.bind(this),
        [UserRole.staff]: this.getListBookingByStaff.bind(this),
        [UserRole.land_renter]: this.getListBookingByLandrenter.bind(this),
      };

      return await getListBookingStrategy[user.role](
        user,
        status,
        type,
        pagination,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListBookingByManager(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      // check type is not request
      if (type !== 'booking') {
        throw new BadRequestException('Manager only get booking');
      }
      // check valid status
      if (
        status === BookingStatus.pending ||
        status === BookingStatus.rejected
      ) {
        throw new BadRequestException('Manager not get pending and rejected');
      }
      // Filter condition status not pending and rejected , but in case status is null
      const filter_condition = status
        ? {
            status: status,
          }
        : {
            status: Not(In([BookingStatus.pending, BookingStatus.rejected])),
          };

      // get list booking by manager except pending and rejected
      const [bookings, total_count] = await Promise.all([
        this.bookingEntity.find({
          where: filter_condition,
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
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.bookingEntity.count({
          where: filter_condition,
        }),
      ]);
      // Parse contract image to url link
      // bookings.forEach((booking) => {
      //   booking.contract_image = booking.contract_image
      //     ? parseUrlLink(booking.contract_image)
      //     : null;
      // });
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        bookings,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListBookingByStaff(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      /**
       * Filter condition status by type
       * 1. type = booking: Get all booking by staff and status except pending
       * 2. type = request: Get all booking by staff and status
       */
      let filter_condition: any = {
        staff_id: user.user_id,
      };
      // 1, Get all booking by staff and status except pending
      if (type === 'booking') {
        filter_condition = status
          ? {
              status: status,
            }
          : {
              status: Not(BookingStatus.pending),
            };
      }
      // 2. Get all booking by staff and status
      if (type === 'request') {
        if (status === BookingStatus.pending_contract) {
          filter_condition = {
            status: Not(In[(BookingStatus.pending, BookingStatus.rejected)]),
          };
        } else {
          filter_condition = status
            ? {
                status: status,
              }
            : {};
        }
      }
      // Get list booking by staff
      const [bookings, total_count] = await Promise.all([
        this.bookingEntity.find({
          where: filter_condition,
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
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.bookingEntity.count({
          where: filter_condition,
        }),
      ]);
      // Get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        bookings,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getListBookingByLandrenter(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      // Filter condition status
      const filter_condition = status
        ? {
            status: status,
          }
        : {};
      // Get list booking by land renter
      const [bookings, total_count] = await Promise.all([
        this.bookingEntity.find({
          where: {
            landrenter_id: user.user_id,
            ...filter_condition,
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
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.bookingEntity.count({
          where: {
            landrenter_id: user.user_id,
            ...filter_condition,
          },
        }),
      ]);
      // Parse contract image to url link
      // bookings.forEach((booking) => {
      //   booking.contract_image = booking.contract_image
      //     ? parseUrlLink(booking.contract_image)
      //     : null;
      // });
      // Get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        bookings,
        pagination: {
          ...pagination,
          total_page,
        },
      };
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
        [BookingStatus.rejected]: this.updateStatusToRejected.bind(this),
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
      // check payment frequency to create transaction
      if (!data.payment_frequency) {
        throw new BadRequestException('Payment frequency is required');
      }
      // Create transaction for payment
      if (data.payment_frequency === BookingPaymentFrequency.multiple) {
        //
      }
      // Create transaction for payment
      // Send mail to land renter
      // Send notification to land renter
      // update status booking to pending payment
      const update_booking = await this.bookingEntity.save({
        ...booking_exist,
        status: BookingStatus.pending_payment,
        contract_image: data.contract_image,
        payment_frequency: data.payment_frequency,
        signed_at: new Date(),
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
   * @function updateStatusToCompleted
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToCompleted(
    booking_exist: BookingLand,
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
    booking_exist: BookingLand,
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
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    return 'updateStatusToPendingPayment';
  }

  /**
   * @function updateStatusToRejected
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToRejected(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any> {
    try {
      // check status booking is pending or pending contract
      if (
        booking_exist.status !== BookingStatus.pending &&
        booking_exist.status !== BookingStatus.pending_contract
      ) {
        throw new BadRequestException('Status booking is not pending');
      }
      // check user is staff or manager
      if (user.role !== UserRole.staff && user.role !== UserRole.manager) {
        throw new ForbiddenException('You are not staff or manager');
      }
      // check have reason reject
      if (!data.reason_for_reject) {
        throw new BadRequestException('Reason for reject is required');
      }
      // update status booking to rejected
      const update_booking = await this.bookingEntity.save({
        ...booking_exist,
        status: BookingStatus.rejected,
        reason_for_reject: data.reason_for_reject,
      });
      // Send mail to land renter
      // Send notification to land renter
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
}
