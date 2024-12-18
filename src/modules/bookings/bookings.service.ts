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
import { IUser } from '../auths/interfaces/IUser.interface';
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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';
import { parsePriceToVND } from 'src/utils/price.util';
import { ExtendStatus } from '../extends/types/extend-status.enum';
import { getTimeByPlusMonths } from 'src/utils/time.utl';
import { convertArrayToContractfile } from 'src/utils/link.util';
import { ServiceSpecificStatus } from '../servicesPackage/types/service-specific-status.enum';
import { ServiceSpecific } from '../servicesPackage/entities/serviceSpecific.entity';

@Injectable()
export class BookingsService implements IBookingService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(
    @InjectRepository(BookingLand)
    private readonly bookingRepository: Repository<BookingLand>,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,

    @Inject(forwardRef(() => ExtendsService))
    private readonly extendsService: ExtendsService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestService: RequestsService,

    private readonly landService: LandsService,

    private readonly mailService: MailService,

    private readonly loggerService: LoggerService,

    private readonly notificationService: NotificationsService,

    private readonly userService: UsersService,
  ) {}

  /**
   * @function createBooking
   * @param createBookingDto
   *
   * @returns
   */
  async createBooking(createBookingDto: CreateBookingDto, land_renter: IUser): Promise<any> {
    try {
      // create time end booking equal time_start + total_month
      const time_end = new Date(createBookingDto.time_start);
      time_end.setMonth(time_end.getMonth() + createBookingDto.total_month);
      // Get detail land
      const land: Land = await this.landService.getDetailLandById(createBookingDto.land_id);
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
        relations: {
          land: true,
        },
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
        await this.extendsService.createRequestExtend(booking_previous);
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
      // check payment frequency
      if (createBookingDto.payment_frequency === BookingPaymentFrequency.multiple) {
        if (createBookingDto.total_month < 12) {
          throw new BadRequestException('You can only pay multiple of at least 12 months');
        }
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
      // send notification to staff
      await this.notificationService.createNotification({
        user_id: land.staff_id,
        title: NotificationTitleEnum.new_booking,
        content: `Yêu cầu thuê đất mới được tạo trên mãnh đất ${land.name} vui lòng kiểm tra và xác nhận`,
        type: NotificationType.booking_land,
        component_id: new_booking.booking_id,
      });
      // send noti to land renter
      await this.notificationService.createNotification({
        user_id: land_renter.user_id,
        title: NotificationTitleEnum.new_booking,
        content: `Yêu cầu thuê đất mới được tạo trên mãnh đất ${land.name}`,
        type: NotificationType.booking_land,
        component_id: new_booking.booking_id,
      });
      // create mail confirm for land renter
      await this.mailService.sendMail(
        land_renter.email,
        SubjectMailEnum.createBooking,
        TemplateMailEnum.createBooking,
        {
          full_name: land_renter.full_name,
          land_id: land.land_id,
          land_name: land.name,
          time_start: new Date(createBookingDto.time_start).toLocaleDateString(),
          time_end: time_end.toLocaleDateString(),
          total_month: createBookingDto.total_month,
          price_per_month: land.price_booking_per_month,
          price_deposit: land.price_booking_per_month * 2,
          total_price: parsePriceToVND(total_price),
          status: 'Chờ xác nhận',
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

  async getListBooking(
    user: IUser,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      const filter_condition: any = {};
      // FIlter condition by manager
      if (user.role === UserRole.manager) {
        if (type !== 'booking') {
          throw new BadRequestException('Manager only get booking');
        }
        // check valid status params
        if (status === BookingStatus.pending || status === BookingStatus.rejected) {
          throw new BadRequestException('Manager not get pending and rejected');
        }
        // Check status
        if (status) {
          filter_condition.status = status;
        } else {
          filter_condition.status = Not(In([BookingStatus.pending, BookingStatus.rejected]));
        }
      }
      // Filter condition by staff
      /**
       * Filter condition status by type
       * 1. type = booking: Get all booking by staff and status except pending
       * 2. type = request: Get all booking by staff and status
       */
      if (user.role === UserRole.staff) {
        filter_condition.staff_id = user.user_id;
        // 1, Get all booking by staff and status except pending
        if (type === 'booking') {
          if (status) {
            filter_condition.status = status;
          } else {
            filter_condition.status = Not(BookingStatus.pending);
          }
        }
        // 2. Get all booking by staff and status
        if (type === 'request') {
          if (status === BookingStatus.pending_contract) {
            filter_condition.status = Not(In([BookingStatus.pending, BookingStatus.rejected]));
          } else {
            if (status) {
              filter_condition.status = status;
            }
          }
        }
      }

      // Filter condition by land renter
      if (user.role === UserRole.land_renter) {
        filter_condition.landrenter_id = user.user_id;
        if (status) {
          filter_condition.status = status;
        }
      }
      const [bookings, total_count] = await Promise.all([
        this.bookingRepository.find({
          where: filter_condition,
          order: {
            updated_at: 'DESC',
            status: 'ASC',
          },
          relations: {
            land: true,
            land_renter: true,
            staff: true,
            extends: true,
            service_specific: true,
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
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.bookingRepository.count({
          where: filter_condition,
        }),
      ]);
      // Count total acreage land is used for buy service
      if (user.role === UserRole.land_renter) {
        let total_acreage_land_is_used: number = 0;
        (bookings as any).map((booking: any) => {
          if (booking.service_specific.length > 0) {
            booking.service_specific.forEach((service: ServiceSpecific) => {
              if (service.status === ServiceSpecificStatus.used) {
                total_acreage_land_is_used += service.acreage_land;
              }
            });
          }
          booking.acreage_land_can_used =
            booking.land.acreage_land - total_acreage_land_is_used > 0
              ? booking.land.acreage_land - total_acreage_land_is_used
              : 0;
        });
      }
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
      if (error instanceof BadRequestException) {
        throw error;
      }
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
    user: IUser,
  ): Promise<any> {
    try {
      // check booking exist
      const booking_exist = await this.bookingRepository.findOne({
        relations: {
          land: true,
          land_renter: true,
          staff: true,
        },
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
        [BookingStatus.pending_contract]: this.updateStatusToPendingContract.bind(this),
        [BookingStatus.pending_payment]: this.updateStatusToPendingPayment.bind(this),
        [BookingStatus.rejected]: this.updateStatusToRejected.bind(this),
      };
      return await updateStatusBookingStrategy[data.status](booking_exist, data, user);
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
    user: IUser,
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
      const land_exist: Land = await this.landService.getDetailLandById(booking_exist.land_id);
      // Check staff is match with land staff
      if (land_exist.staff_id !== user.user_id) {
        throw new ForbiddenException('You are not staff of this land');
      }
      // send notification to manager
      const manager: User[] = await this.userService.getListUserByRole(UserRole.manager);
      // send notification to manager
      await this.notificationService.createNotification({
        user_id: manager[0].user_id,
        title: NotificationTitleEnum.manager_booking_pending_sign,
        content: `Hợp đồng thuê đất mới đã được tạo trên ${land_exist.name} vui lòng kiểm tra và xác nhận`,
        type: NotificationType.booking_land,
        component_id: booking_exist.booking_id,
      });
      // config update
      booking_exist.status = BookingStatus.pending_contract;
      // update status booking to pending contract
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
      });
      return update_booking;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
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
    user: IUser,
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
      // config update
      (booking_exist.expired_schedule_at = new Date(new Date().getTime() + 48 * 60 * 60 * 1000)),
        (booking_exist.status = BookingStatus.pending_sign);
      // update status booking to pending sign
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
      });
      // Send mail to land renter and make expred schedule after 48h
      await this.mailService.sendMail(
        booking_exist.land_renter.email,
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
          status: 'Chờ ký tên',
          user_mail: user.email,
          expired_schedule_at: update_booking.expired_schedule_at.toLocaleDateString(),
          staff_full_name: booking_exist.staff.full_name,
          staff_mail: booking_exist.staff.email,
          staff_phone: booking_exist.staff.full_name,
        },
      );
      // send notification to land renter
      await this.notificationService.createNotification({
        user_id: booking_exist.land_renter.user_id,
        title: NotificationTitleEnum.booking_pending_sign,
        content: `Yêu cầu thuê đất của bạn đã được xác nhận, vui lòng kiểm tra và xác nhận`,
        type: NotificationType.booking_land,
        component_id: booking_exist.booking_id,
      });
      // send notification to staff
      await this.notificationService.createNotification({
        user_id: booking_exist.staff_id,
        title: NotificationTitleEnum.staff_booking_pending_sign,
        content: `Hợp đồng thuê đất mới đã được xác nhận trên ${booking_exist.land.name} vui lòng kiểm tra và xác nhận`,
        type: NotificationType.booking_land,
        component_id: booking_exist.booking_id,
      });
      return update_booking;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusToPendingPayment
   * @param booking_exist
   * @param data
   * @param user
   * @returns
   */

  async updateStatusToPendingPayment(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: IUser,
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
      const land_exist: Land = await this.landService.getDetailLandById(booking_exist.land_id);
      // Check staff is match with land staff
      if (land_exist.staff_id !== user.user_id) {
        throw new ForbiddenException('You are not staff of this land');
      }
      // Check data have contract image
      if (!data.contract_image) {
        throw new BadRequestException('Contract image is required');
      }
      // Send mail to land renter
      // Send notification to land renter
      await this.notificationService.createNotification({
        user_id: booking_exist.land_renter.user_id,
        title: NotificationTitleEnum.booking_pending_payment,
        content: `Thanh toán cho yêu cầu thuê đất của bạn đang chờ xử lý`,
        type: NotificationType.booking_land,
        component_id: booking_exist.booking_id,
      });
      // config update
      booking_exist.status = BookingStatus.pending_payment;
      booking_exist.contract_image = data.contract_image;
      booking_exist.signed_at = new Date();
      // update status booking to pending payment
      await this.bookingRepository.save({
        ...booking_exist,
      });
      // Create transaction for payment
      const transaction = await this.transactionService.createTransactionPaymentBookingLand(
        booking_exist.booking_id,
      );
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
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
        relations: {
          land: true,
        },
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
      // config update
      booking_exist.status = BookingStatus.completed;
      // update status booking to completed
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
      });
      this.loggerService.log(`Booking ${transaction.booking_land_id} is completed`);
      // Config contract image path
      const contract_image_path: any = convertArrayToContractfile(booking_exist.contract_image);
      // conmvert contract image path to name
      contract_image_path;
      await Promise.all([
        // Send mail to land renter
        this.mailService.sendMail(
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
            total_price: parsePriceToVND(this.getTotalPriceBooking(booking_exist)),
            status: 'Đã hoàn thành',
            user_mail: booking_exist.land_renter.email,
            transaction_code: transaction.transaction_code,
            transaction_price: transaction.total_price,
            transaction_status: 'Thành công',
          },
          contract_image_path,
        ),
        // Send notification to land renter
        this.notificationService.createNotification({
          user_id: booking_exist.land_renter.user_id,
          title: NotificationTitleEnum.booking_completed,
          content: NotificationContentEnum.booking_completed(booking_exist.land.name),
          type: NotificationType.booking_land,
          component_id: booking_exist.booking_id,
        }),
        // send notification to staff
        this.notificationService.createNotification({
          user_id: booking_exist.staff_id,
          title: NotificationTitleEnum.booking_completed,
          content: NotificationContentEnum.booking_completed(booking_exist.land.name),
          type: NotificationType.booking_land,
          component_id: booking_exist.booking_id,
        }),
      ]);
      return update_booking;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
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
    user: IUser,
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
      // config update
      booking_exist.status = BookingStatus.rejected;
      booking_exist.reason_for_reject = data.reason_for_reject;
      // update status booking to rejected
      const update_booking = await this.bookingRepository.save({
        ...booking_exist,
      });
      // Send mail to land renter
      // Send notification to land renter
      await this.notificationService.createNotification({
        user_id: booking_exist.land_renter.user_id,
        title: NotificationTitleEnum.booking_rejected,
        content: `Yêu cầu thuê đất của bạn đã bị từ chối với lí do ${data.reason_for_reject}`,
        type: NotificationType.booking_land,
        component_id: booking_exist.booking_id,
      });
      return update_booking;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
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
    try {
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
        //     status: 'Hết hạn',
        //     user_mail: booking.land_renter.email,
        //   },
        // );
        // send notification to land renter
      });
      // check booking expired
      const list_booking_expired = await this.bookingRepository.find({
        relations: {
          land: true,
          extends: true,
        },
        where: {
          status: BookingStatus.completed,
          time_end: LessThanOrEqual(new Date()),
        },
      });
      // define booking_expired
      const list_booking_expired_with_extends = [];
      // set booking expired time by add extend month
      for (const booking of list_booking_expired) {
        if (booking.extends.length > 0) {
          for (const extend of booking.extends) {
            if (extend.status === ExtendStatus.completed) {
              booking.time_end = getTimeByPlusMonths(booking.time_end, extend.total_month);
            }
          }
        }
        // check condition
        if (new Date() > booking.time_end) {
          list_booking_expired_with_extends.push(booking);
        }
      }
      // Set booking to expired
      list_booking_expired_with_extends.forEach(async (booking) => {
        // Set status to expired
        await this.bookingRepository.update(
          {
            booking_id: booking.booking_id,
          },
          {
            status: BookingStatus.expired,
          },
        );

        this.loggerService.log(`Booking ${booking.booking_id} is expired`);
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
        //     status: 'Hết hạn',
        //     user_mail: booking.land_renter.email,
        //   },
        // );
        // send notification to land renter
      });
    } catch (error) {
      this.logger.error(error.message);
      this.loggerService.error(error.message, error.stack);
    }
  }

  async updateBookingByExtend(booking_id: string, total_month: number): Promise<any> {
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
        new Date(booking.time_end).setMonth(new Date(booking.time_end).getMonth() + total_month),
      );
      // update booking
      const update_booking = await this.bookingRepository.save({
        ...booking,
        time_end: time_end,
        total_month: booking.total_month + total_month,
      });
      return update_booking;
    } catch (error) {}
  }

  /**
   * Create refund booking transaction for land renter when report booking confirm
   * @function createRefundBooking
   * @param booking
   * @returns
   */

  async createRefundBooking(booking: BookingLand): Promise<any> {
    try {
      // create transaction refund
      const transactionDTO: Partial<CreateTransactionDTO> = {
        booking_land_id: booking.booking_id,
        user_id: booking.landrenter_id,
        total_price: booking.price_deposit * booking.quality_report || 0,
        purpose: TransactionPurpose.booking_land,
        type: TransactionType.refund,
      };
      const transaction: Transaction = await this.transactionService.createTransaction(
        transactionDTO as CreateTransactionDTO,
      );
      // send notification to land renter
      await this.notificationService.createNotification({
        user_id: booking.landrenter_id,
        title: NotificationTitleEnum.booking_refund,
        content: NotificationContentEnum.booking_refund(
          booking.land.name,
          parsePriceToVND(transaction.total_price),
        ),
        type: NotificationType.transaction,
        component_id: transaction.transaction_id,
      });
      // send mail to land renter
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * update booking call by report service
   * @param booking_id
   * @param data
   * @returns
   */

  async updateBookingByReport(booking_id: string, quality_report: number): Promise<any> {
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
        quality_report: quality_report,
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

  async getBookingsForDashboard(): Promise<any> {
    try {
      const [total, total_completed] = await Promise.all([
        this.bookingRepository.count(),
        this.bookingRepository.count({
          where: {
            status: BookingStatus.completed,
          },
        }),
      ]);
      return {
        total,
        total_completed,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private getTotalPriceBooking(booking: BookingLand): number {
    const total_price_booking: number =
      (booking.time_end.getMonth() - booking.time_start.getMonth() + 1) * booking.price_per_month +
      booking.price_deposit;
    const total_price = total_price_booking + booking.price_deposit;
    return total_price;
  }
}
