import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IExtendService } from './interfaces/IExtendService.interface';
import { CreateExtendDto } from './dto/create-extend.dto';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Extend } from './entities/extend.entity';
import { In, Not, Repository } from 'typeorm';
import { BookingStatus } from '../bookings/types/booking-status.enum';
import { ExtendStatus } from './types/extend-status.enum';
import { UpdateExtendDTO } from './dto/update-extend.dto';
import { IUser } from '../auths/interfaces/IUser.interface';
import { UserRole } from '../users/types/user-role.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { TransactionStatus } from '../transactions/types/transaction-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { getTimeByPlusMonths } from 'src/utils/time.utl';
import { parsePriceToVND } from 'src/utils/price.util';
import { getNameOfPath } from 'src/utils/link.util';

@Injectable()
export class ExtendsService implements IExtendService {
  constructor(
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingLandService: BookingsService,

    @InjectRepository(Extend)
    private readonly extendRepository: Repository<Extend>,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,

    private readonly notificationService: NotificationsService,

    private readonly mailService: MailService,
  ) {}

  async createExtend(createExtendDTO: CreateExtendDto): Promise<any> {
    try {
      // check extend exist
      const extend_exist = await this.extendRepository.findOne({
        where: {
          booking_land_id: createExtendDTO.booking_land_id,
          status: Not(In([ExtendStatus.canceled, ExtendStatus.rejected, ExtendStatus.completed])),
        },
      });
      if (extend_exist) {
        throw new BadRequestException('Extend is already exist please handle this extend first');
      }
      // Get booking land by id
      const bookingLand: BookingLand = await this.bookingLandService.getBookingDetail(
        createExtendDTO.booking_land_id,
      );
      // check booking status
      if (bookingLand.status !== BookingStatus.completed) {
        throw new BadRequestException('Booking is not paid yet');
      }
      // check booking payment
      for (const transaction of bookingLand.transactions) {
        if (transaction.status !== TransactionStatus.succeed) {
          throw new BadRequestException('Booking is not paid yet');
        }
      }
      // get time end by plus month
      const time_end = new Date(
        new Date(bookingLand.time_end).setMonth(
          new Date(bookingLand.time_end).getMonth() + createExtendDTO.total_month,
        ),
      );
      // check exist booking land in time
      const checkExistBookingLand: BookingLand[] =
        await this.bookingLandService.checkExistBookingByTimeAndLand(
          bookingLand.booking_id,
          bookingLand.land_id,
          time_end,
        );
      if (checkExistBookingLand.length > 0) {
        throw new BadRequestException(
          `Land is already booked in ${checkExistBookingLand[0].time_end}`,
        );
      }
      // create extend with default status is pending contract
      const extend = await this.extendRepository.save({
        booking_land_id: bookingLand.booking_id,
        total_month: createExtendDTO.total_month,
        time_start: bookingLand.time_end,
        price_per_month: bookingLand.land.price_booking_per_month,
      });
      // Send noti for landrenter
      await this.notificationService.createNotification({
        user_id: bookingLand.landrenter_id,
        component_id: extend.extend_id,
        content: NotificationContentEnum.create_extend(bookingLand.land.name),
        type: NotificationType.extend,
        title: NotificationTitleEnum.create_extend,
      });

      // Send noti for staff
      await this.notificationService.createNotification({
        user_id: bookingLand.land.staff_id,
        component_id: extend.extend_id,
        content: NotificationContentEnum.create_extend(bookingLand.land.name),
        type: NotificationType.extend,
        title: NotificationTitleEnum.create_extend,
      });
      return extend;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * create request extend is used when new booking is created
   * @function createRequestExtend
   * @param booking_previous
   * @returns
   */

  async createRequestExtend(booking_previous: BookingLand): Promise<any> {
    try {
      // get detail
      const new_extend = await this.extendRepository.save({
        booking_land_id: booking_previous.booking_id,
        time_start: booking_previous.time_end,
        status: ExtendStatus.pending,
      });
      // send notification to user
      await this.notificationService.createNotification({
        user_id: new_extend.booking_land.landrenter_id,
        component_id: new_extend.extend_id,
        content: NotificationContentEnum.request_extend(booking_previous.land.name),
        type: NotificationType.extend,
        title: NotificationTitleEnum.request_extend,
      });
      // send mail to user
      return new_extend;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update extend to change status
   * @function updateExtend
   * @param data
   * @param extend_id
   * @param user
   * @returns
   */

  async updateExtend(data: UpdateExtendDTO, extend_id: string, user: IUser): Promise<any> {
    try {
      // find extend by id
      const extend = await this.extendRepository.findOne({
        relations: {
          booking_land: {
            land: true,
          },
        },
        where: { extend_id: extend_id },
      });
      if (!extend) {
        throw new BadRequestException('Extend is not found');
      }
      // Check conditoin update to pending_contract
      if (data.status === ExtendStatus.pending_contract) {
        // check is land renter
        if (user.role !== UserRole.land_renter) {
          throw new ForbiddenException('You are not land renter');
        }
        // check is owner of booking
        if (extend.booking_land.landrenter_id !== user.user_id) {
          throw new ForbiddenException('You are not owner of booking');
        }
        // Check status is pending
        if (extend.status !== ExtendStatus.pending) {
          throw new BadRequestException('Extend is not pending');
        }
        // Check field is include
        if (!data.total_month) {
          throw new BadRequestException('Total month is required');
        }
        // update extend
        await this.extendRepository.update(
          {
            extend_id: extend_id,
          },
          {
            ...data,
          },
        );
        // send notification to staff
        await this.notificationService.createNotification({
          user_id: extend.booking_land.land.staff_id,
          component_id: extend.extend_id,
          content: NotificationContentEnum.create_extend(extend.booking_land.land.name),
          type: NotificationType.extend,
          title: NotificationTitleEnum.create_extend,
        });
      }
      // Check condition update to rejected
      if (data.status === ExtendStatus.rejected) {
        // check status
        if (
          extend.status !== ExtendStatus.pending &&
          extend.status !== ExtendStatus.pending_contract
        ) {
          throw new BadRequestException('Extend is not pending or pending contract');
        }
        // Check status is pending rejected by land renter
        if (extend.status === ExtendStatus.pending) {
          // check is land renter
          if (user.role !== UserRole.land_renter) {
            throw new ForbiddenException('You are not land renter');
          }
          // check is owner of booking
          if (extend.booking_land.landrenter_id !== user.user_id) {
            throw new ForbiddenException('You are not owner of booking');
          }
          // check reason for reject
          if (!data.reason_for_reject) {
            throw new BadRequestException('Reason for reject is required');
          }
          // update extend
          await this.extendRepository.update(
            {
              extend_id: extend_id,
            },
            {
              ...data,
            },
          );
          // send notification to staff
          await this.notificationService.createNotification({
            user_id: extend.booking_land.land.staff_id,
            component_id: extend.extend_id,
            content: NotificationContentEnum.reject_extend(extend.booking_land.land.name),
            type: NotificationType.extend,
            title: NotificationTitleEnum.reject_extend,
          });
        }
        // Check status is pending rejected by staff
        if (extend.status === ExtendStatus.pending_contract) {
          // check is staff
          if (user.role !== UserRole.manager) {
            throw new ForbiddenException('You are not manager');
          }
          // check reason for reject
          if (!data.reason_for_reject) {
            throw new BadRequestException('Reason for reject is required');
          }
          // update extend
          await this.extendRepository.update(
            {
              extend_id: extend_id,
            },
            {
              ...data,
            },
          );
          // send notification to land renter
          await this.notificationService.createNotification({
            user_id: extend.booking_land.landrenter_id,
            component_id: extend.extend_id,
            content: NotificationContentEnum.reject_extend(extend.booking_land.land.name),
            type: NotificationType.extend,
            title: NotificationTitleEnum.reject_extend,
          });
        }
      }
      // check condition update to pending sign
      if (data.status === ExtendStatus.pending_sign) {
        // check is manager
        if (user.role !== UserRole.manager) {
          throw new ForbiddenException('You are not manager');
        }
        // check extend status
        if (extend.status !== ExtendStatus.pending_contract) {
          throw new BadRequestException('Extend is not pending contract');
        }
        // // send notification to user
        await this.notificationService.createNotification({
          user_id: extend.booking_land.landrenter_id,
          component_id: extend.extend_id,
          content: NotificationContentEnum.pending_sign_extend(extend.booking_land.land.name),
          type: NotificationType.extend,
          title: NotificationTitleEnum.pending_sign_extend,
        });
      }
      // check condition update to pending payment
      if (data.status === ExtendStatus.pending_payment) {
        // check is staff
        if (user.role !== UserRole.staff) {
          throw new ForbiddenException('You are not staff');
        }
        // check extend status
        if (extend.status !== ExtendStatus.pending_sign) {
          throw new BadRequestException('Extend is not pending sign');
        }
        // check exist contract
        if (!data.contract_image) {
          throw new BadRequestException('Contract image is required');
        }
        // create transaction
        const transactionData: Partial<CreateTransactionDTO> = {
          extend_id: extend_id,
          total_price: extend.total_month * extend.price_per_month,
          purpose: TransactionPurpose.extend,
          user_id: extend.booking_land.landrenter_id,
        };
        await this.transactionService.createTransaction(transactionData as CreateTransactionDTO);
        // send notification to user
        await this.notificationService.createNotification({
          user_id: extend.booking_land.landrenter_id,
          component_id: extend.extend_id,
          content: NotificationContentEnum.pending_payment_extend(extend.booking_land.land.name),
          type: NotificationType.extend,
          title: NotificationTitleEnum.pending_payment_extend,
        });
      }
      // update extend
      await this.extendRepository.save({
        ...extend,
        ...data,
      });

      return await this.extendRepository.findOne({
        where: { extend_id: extend_id },
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * update extend to complete call by transaction service when transaction is succeed
   * @function
   * @param extend_id
   * @returns
   */

  async updateExtendToComplete(extend_id: string): Promise<any> {
    try {
      // find extend by id
      const extend = await this.extendRepository.findOne({
        where: { extend_id: extend_id },
        relations: {
          booking_land: {
            land: true,
            land_renter: true,
          },
          transactions: true,
        },
      });
      if (!extend) {
        throw new BadRequestException('Extend is not found');
      }
      // check extend status
      if (extend.status !== ExtendStatus.pending_payment) {
        throw new BadRequestException('Extend is not pending payment');
      }
      // update extend
      await this.extendRepository.update(
        {
          extend_id: extend_id,
        },
        {
          status: ExtendStatus.completed,
        },
      );
      // // update booking
      // await this.bookingLandService.updateBookingByExtend(
      //   extend.booking_land_id,
      //   extend.total_month,
      // );
      // send notification to user
      await this.notificationService.createNotification({
        user_id: extend.booking_land.landrenter_id,
        component_id: extend.extend_id,
        content: NotificationContentEnum.extend_completed(extend.booking_land.land.name),
        type: NotificationType.extend,
        title: NotificationTitleEnum.extend_completed,
      });
      // send mail to user
      await this.mailService.sendMail(
        extend.booking_land.land_renter.email,
        SubjectMailEnum.paymentExtend,
        TemplateMailEnum.paymentExtend,
        {
          full_name: extend.booking_land.land_renter.full_name,
          land_id: extend.booking_land.land_id,
          land_name: extend.booking_land.land.name,
          time_start: extend.time_start.toLocaleDateString(),
          time_end: getTimeByPlusMonths(extend.time_start, extend.total_month).toLocaleDateString(),
          total_month: extend.total_month,
          price_per_month: extend.price_per_month,
          total_price: parsePriceToVND(extend.total_month * extend.price_per_month),
          status: 'Đã hoàn thành',
          user_mail: extend.booking_land.land_renter.email,
          transaction_code: extend.transactions[0].transaction_code,
          transaction_price: extend.transactions[0].total_price,
          transaction_status: 'Thành công',
        },
        [
          {
            filename: getNameOfPath(extend.contract_image),
            path: extend.contract_image,
          },
        ],
      );

      return await this.extendRepository.findOne({
        where: { extend_id: extend_id },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
