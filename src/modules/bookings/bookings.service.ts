import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookingService } from './interfaces/IBookingService.interface';
import { LandsService } from '../lands/lands.service';
import { Land } from '../lands/entities/land.entity';
import { LandStatus } from '../lands/types/land-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingLand } from './entities/bookingLand.entity';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { BookingStatus } from './types/booking-status.enum';
import { Payload } from '../auths/types/payload.type';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusBookingDTO } from './dto/update-status-booking.dto';
import { MailService } from 'src/mails/mail.service';
import { BookingPaymentFrequency } from './types/booking-payment.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { TransactionsService } from '../transactions/transactions.service';
import { LoggerService } from 'src/logger/logger.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ExtendsService } from '../extends/extends.service';
import { RequestsService } from '../requests/requests.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { TransactionType } from '../transactions/types/transaction-type.enum';

@Injectable()
export class BookingsService implements IBookingService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(
    @InjectRepository(BookingLand)
    private readonly bookingRepository: Repository<BookingLand>,

    private readonly landService: LandsService,

    private readonly mailService: MailService,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,

    @Inject(forwardRef(() => ExtendsService))
    private readonly extendsService: ExtendsService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,
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
      // create time end booking equal time_start + total_month
      const time_end = new Date(createBookingDto.time_start);
      time_end.setMonth(time_end.getMonth() + createBookingDto.total_month);
      // Get detail land
      const land: Land = await this.landService.getDetailLandById(
        createBookingDto.land_id,
      );
      //  Check if exist booking of land in time land
      const booking_land_exist = await this.bookingRepository.find({
        where: [
          {
            land_id: createBookingDto.land_id,
            status: BookingStatus.completed,
            time_start: MoreThanOrEqual(createBookingDto.time_start),
            time_end: LessThanOrEqual(time_end),
          },
          {
            land_id: createBookingDto.land_id,
            status: BookingStatus.completed,
            time_start: LessThanOrEqual(createBookingDto.time_start),
            time_end: MoreThanOrEqual(time_end),
          },
          {
            land_id: createBookingDto.land_id,
            status: BookingStatus.completed,
            time_start: LessThanOrEqual(createBookingDto.time_start),
            time_end: MoreThanOrEqual(createBookingDto.time_start),
          },
          {
            land_id: createBookingDto.land_id,
            status: BookingStatus.completed,
            time_start: LessThanOrEqual(time_end),
            time_end: MoreThanOrEqual(time_end),
          },
        ],
      });
      if (booking_land_exist.length > 0) {
        throw new BadRequestException('Land is already booked in this time');
      }
      // Check land has staff is active
      if (!land.staff_id) {
        throw new BadRequestException('Wait for manager assign staff to land');
      }
      // check previous booking is completed for send request extend
      const booking_previous = await this.bookingRepository.findOne({
        where: {
          land_id: createBookingDto.land_id,
          status: BookingStatus.completed,
          time_end: LessThanOrEqual(createBookingDto.time_start),
        },
        order: {
          time_end: 'DESC',
        },
      });
      if (booking_previous) {
        // send request extend to old booking
        await this.extendsService.createRequestExtend(
          booking_previous.booking_id,
        );
      }
      // Get price per month of land
      const total_price =
        land.price_booking_per_month * createBookingDto.total_month +
        land.price_booking_per_month * 2;
      // check if already have booking in this time and status != pending and != reject
      const booking_exist = await this.bookingRepository.find({
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
      const new_booking = await this.bookingRepository.save({
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
      await this.mailService.sendMail(
        land_renter.email,
        SubjectMailEnum.createBooking,
        TemplateMailEnum.createBooking,
        {
          full_name: land_renter.full_name,
          land_id: land.land_id,
          land_name: land.name,
          time_start: createBookingDto.time_start.toLocaleDateString(),
          time_end: time_end.toLocaleDateString(),
          total_month: createBookingDto.total_month,
          price_per_month: land.price_booking_per_month,
          price_deposit: land.price_booking_per_month * 2,
          total_price: total_price,
          staus: 'Chờ xác nhận',
          user_mail: land_renter.email,
        },
      );
      // update land status to booked
      await this.landService.updateLandStatus(land.land_id, LandStatus.booked);
      // send request extend to old booking
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
        this.bookingRepository.find({
          where: filter_condition,
          order: {
            status: 'ASC',
            updated_at: 'DESC',
            extends: {
              created_at: 'DESC',
            },
          },
          relations: {
            land: true,
            land_renter: true,
            staff: true,
            extends: true,
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
        this.bookingRepository.count({
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
            status: Not(In([BookingStatus.pending, BookingStatus.rejected])),
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
        this.bookingRepository.find({
          where: filter_condition,
          order: {
            status: 'ASC',
            updated_at: 'DESC',
            extends: {
              created_at: 'DESC',
            },
          },
          relations: {
            land: true,
            land_renter: true,
            staff: true,
            extends: true,
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
        this.bookingRepository.count({
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

  async getListBookingByLandrenter(
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
        this.bookingRepository.find({
          where: {
            landrenter_id: user.user_id,
            ...filter_condition,
          },
          order: {
            status: 'ASC',
            updated_at: 'DESC',
            extends: {
              created_at: 'DESC',
            },
          },
          relations: {
            land: true,
            land_renter: true,
            staff: true,
            extends: true,
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
        this.bookingRepository.count({
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
      const booking = await this.bookingRepository.findOne({
        where: {
          booking_id: bookingId,
        },
        relations: {
          land: true,
          land_renter: true,
          staff: true,
          extends: true,
          transactions: true,
        },
        order: {
          extends: {
            created_at: 'DESC',
          },
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
      const booking_exist = await this.bookingRepository.findOne({
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

      // update status booking to pending contract
      const update_booking = await this.bookingRepository.save({
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
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
        status: BookingStatus.pending_contract,
        expired_schedule_at: new Date(
          new Date().getTime() + 48 * 60 * 60 * 1000,
        ),
      });
      // Send mail to land renter and make expred schedule after 48h
      await this.mailService.sendMail(
        user.email,
        SubjectMailEnum.bookingSheduleSign,
        TemplateMailEnum.bookingSheduleSign,
        {
          full_name: user.full_name,
          land_id: booking_exist.land_id,
          land_name: booking_exist.land.name,
          time_start: booking_exist.time_start.toLocaleDateString(),
          time_end: booking_exist.time_end.toLocaleDateString(),
          total_month: booking_exist.total_month,
          price_per_month: booking_exist.price_per_month,
          price_deposit: booking_exist.price_deposit,
          total_price: this.getTotalPriceBooking(booking_exist),
          staus: 'Chờ ký tên',
          user_mail: user.email,
          expired_schedule_at:
            update_booking.expired_schedule_at.toLocaleDateString(),
        },
      );
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
      // check time for payment
      if (data.payment_frequency === BookingPaymentFrequency.multiple) {
        if (booking_exist.total_month < 12) {
          throw new BadRequestException(
            'Can not payment multiple time with total month < 12',
          );
        }
      }
      // Send mail to land renter
      // Send notification to land renter
      // update status booking to pending payment
      await this.bookingRepository.save({
        ...booking_exist,
        status: BookingStatus.pending_payment,
        contract_image: data.contract_image,
        payment_frequency: data.payment_frequency,
        signed_at: new Date(),
      });
      // Create transaction for payment
      const transaction =
        await this.transactionService.createTransactionPaymentBookingLand(
          booking_exist.booking_id,
        );
      return transaction;
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

  async updateStatusToCompleted(transaction: Transaction): Promise<any> {
    try {
      // get detail booking
      const booking_exist = await this.bookingRepository.findOne({
        where: {
          booking_id: transaction.booking_land_id,
        },
      });
      if (!booking_exist) {
        throw new BadRequestException('Booking not found');
      }
      // check status booking is pending payment
      if (booking_exist.status !== BookingStatus.pending_payment) {
        throw new BadRequestException('Status booking is not pending payment');
      }
      // update status booking to completed
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
        status: BookingStatus.completed,
      });
      this.loggerService.log(
        `Booking ${transaction.booking_land_id} is completed`,
      );
      // Send mail to land renter
      await this.mailService.sendMail(
        booking_exist.land_renter.email,
        SubjectMailEnum.paymentBooking,
        TemplateMailEnum.paymentBooking,
        {
          full_name: booking_exist.land_renter.full_name,
          land_id: booking_exist.land_id,
          land_name: booking_exist.land.name,
          time_start: booking_exist.time_start.toLocaleDateString(),
          time_end: booking_exist.time_end.toLocaleDateString(),
          total_month: booking_exist.total_month,
          price_per_month: booking_exist.price_per_month,
          price_deposit: booking_exist.price_deposit,
          total_price: this.getTotalPriceBooking(booking_exist),
          staus: 'Đã hoàn thành',
          user_mail: booking_exist.land_renter.email,
          transaction_code: transaction.transaction_code,
          transaction_price: transaction.total_price,
          transaction_status: 'Thành công',
        },
      );
      // Send notification to land renter
      return update_booking;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
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
      const update_booking = await this.bookingRepository.save({
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

  async checkExistBookingByTimeAndLand(
    booking_land_id: string,
    land_id: string,
    time_end: Date,
  ): Promise<any> {
    try {
      // Check if exist booking of land in time land
      const booking_land_exist = await this.bookingRepository.find({
        where: [
          {
            booking_id: Not(booking_land_id),
            land_id: land_id,
            time_start: LessThanOrEqual(time_end),
            time_end: MoreThanOrEqual(time_end),
          },
          {
            booking_id: Not(booking_land_id),
            land_id: land_id,
            time_start: LessThanOrEqual(time_end),
            time_end: LessThanOrEqual(time_end),
          },
        ],
      });
      return booking_land_exist;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkBookingIsExpired(): Promise<any> {
    // Get all booking is pending contract and expired schedule at
    const booking_expired_schedule = await this.bookingRepository.find({
      where: {
        status: BookingStatus.pending_sign,
        expired_schedule_at: LessThanOrEqual(new Date()),
      },
    });
    // Set booking to canceled
    booking_expired_schedule.forEach(async (booking) => {
      await this.bookingRepository.save({
        ...booking,
        status: BookingStatus.canceled,
        reason_for_cancel: `Expired sign schedule at ${booking.expired_schedule_at.toLocaleDateString()}`,
      });
      // Send mail to land renter
      // await this.mailService.sendMail(
      //   booking.land_renter.email,
      //   SubjectMailEnum.bookingExpired,
      //   TemplateMailEnum.bookingExpired,
      //   {
      //     full_name: booking.land_renter.full_name,
      //     land_id: booking.land_id,
      //     land_name: booking.land.name,
      //     time_start: booking.time_start.toLocaleDateString(),
      //     time_end: booking.time_end.toLocaleDateString(),
      //     total_month: booking.total_month,
      //     price_per_month: booking.price_per_month,
      //     price_deposit: booking.price_deposit,
      //     total_price: this.getTotalPriceBooking(booking),
      //     staus: 'Hết hạn',
      //     user_mail: booking.land_renter.email,
      //   },
      // );
      // send notification to land renter
    });
    // check booking expired
    const booking_expired = await this.bookingRepository.find({
      relations: {
        land: true,
      },
      where: {
        time_end: LessThanOrEqual(new Date()),
        status: BookingStatus.completed,
      },
    });
    // Set booking to expired
    booking_expired.forEach(async (booking) => {
      // Set status to expired
      await this.bookingRepository.save({
        ...booking,
        status: BookingStatus.expired,
      });
      // Create report for this land
      await this.requestService.createRequestReportLand(booking);
      // Send mail to land renter
      // await this.mailService.sendMail(
      //   booking.land_renter.email,
      //   SubjectMailEnum.bookingExpired,
      //   TemplateMailEnum.bookingExpired,
      //   {
      //     full_name: booking.land_renter.full_name,
      //     land_id: booking.land_id,
      //     land_name: booking.land.name,
      //     time_start: booking.time_start.toLocaleDateString(),
      //     time_end: booking.time_end.toLocaleDateString(),
      //     total_month: booking.total_month,
      //     price_per_month: booking.price_per_month,
      //     price_deposit: booking.price_deposit,
      //     total_price: this.getTotalPriceBooking(booking),
      //     staus: 'Hết hạn',
      //     user_mail: booking.land_renter.email,
      //   },
      // );
      // send notification to land renter
    });
  }

  async updateBookingByExtend(
    booking_id: string,
    total_month: number,
  ): Promise<any> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: {
          booking_id: booking_id,
        },
        relations: {
          land: true,
        },
      });
      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
      // get time end by plus month
      const time_end = new Date(
        new Date(booking.time_end).setMonth(
          new Date(booking.time_end).getMonth() + total_month,
        ),
      );
      // update booking
      const update_booking = await this.bookingRepository.save({
        ...booking,
        time_end: time_end,
        total_month: booking.total_month + total_month,
        total_price:
          booking.total_price +
          booking.land.price_booking_per_month * total_month,
      });
      return update_booking;
    } catch (error) {}
  }

  async createRefundBooking(booking_id: string): Promise<any> {
    try {
      // get booking detail
      const booking = await this.bookingRepository.findOne({
        where: {
          booking_id: booking_id,
        },
        relations: {
          land_renter: true,
          land: true,
        },
      });
      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
      // create transaction refund
      const transactionDTO: Partial<CreateTransactionDTO> = {
        booking_land_id: booking_id,
        user_id: booking.landrenter_id,
        total_price: booking.price_deposit * booking.quality_report || 0,
        purpose: TransactionPurpose.booking_land,
        type: TransactionType.refund,
      };
      const transaction = await this.transactionService.createTransaction(
        transactionDTO as CreateTransactionDTO,
      );
      // send notification to land renter
      // send mail to land renter
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  async updateBookingByReport(booking_id: string, data: any): Promise<any> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: {
          booking_id: booking_id,
        },
        relations: {
          land: true,
        },
      });
      if (!booking) {
        throw new BadRequestException('Booking not found');
      }
      // update booking
      const update_booking = await this.bookingRepository.save({
        ...booking,
        status: BookingStatus.completed,
      });
      // send notification to land renter
      // send mail to land renter
      return update_booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private getTotalPriceBooking(booking: BookingLand): number {
    const total_price_booking: number =
      (booking.time_end.getMonth() - booking.time_start.getMonth() + 1) *
        booking.price_per_month +
      booking.price_deposit;
    const total_price = total_price_booking + booking.price_deposit;
    return total_price;
  }
}
