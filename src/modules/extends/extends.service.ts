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
import { Payload } from '../auths/types/payload.type';
import { UserRole } from '../users/types/user-role.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { TransactionStatus } from '../transactions/types/transaction-status.enum';

@Injectable()
export class ExtendsService implements IExtendService {
  constructor(
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingLandService: BookingsService,

    @InjectRepository(Extend)
    private readonly extendRepository: Repository<Extend>,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,
  ) {}

  async createExtend(createExtendDTO: CreateExtendDto): Promise<any> {
    try {
      // check extend exist
      const extend_exist = await this.extendRepository.findOne({
        where: {
          booking_land_id: createExtendDTO.booking_land_id,
          status: Not(
            In([
              ExtendStatus.canceled,
              ExtendStatus.rejected,
              ExtendStatus.completed,
            ]),
          ),
        },
      });
      if (extend_exist) {
        throw new BadRequestException(
          'Extend is already exist please handle this extend first',
        );
      }
      // Get booking land by id
      const bookingLand: BookingLand =
        await this.bookingLandService.getBookingDetail(
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
          new Date(bookingLand.time_end).getMonth() +
            createExtendDTO.total_month,
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
      return extend;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createRequestExtend(booking_land_id: string): Promise<any> {
    try {
      const new_extend = await this.extendRepository.save({
        booking_land_id: booking_land_id,
        status: ExtendStatus.pending,
      });
      // send notification to user
      // send mail to user
      return new_extend;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateExtend(
    data: UpdateExtendDTO,
    extend_id: string,
    user: Payload,
  ): Promise<any> {
    try {
      // find extend by id
      const extend = await this.extendRepository.findOne({
        where: { extend_id: extend_id },
      });
      if (!extend) {
        throw new BadRequestException('Extend is not found');
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
          user_id: user.user_id,
        };
        await this.transactionService.createTransaction(
          transactionData as CreateTransactionDTO,
        );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateExtendToComplete(extend_id: string): Promise<any> {
    try {
      // find extend by id
      const extend = await this.extendRepository.findOne({
        where: { extend_id: extend_id },
      });
      if (!extend) {
        throw new BadRequestException('Extend is not found');
      }
      // check extend status
      if (extend.status !== ExtendStatus.pending_payment) {
        throw new BadRequestException('Extend is not pending payment');
      }
      // update extend
      await this.extendRepository.save({
        ...extend,
        status: ExtendStatus.completed,
      });
      // update booking
      await this.bookingLandService.updateBookingByExtend(
        extend.booking_land_id,
        extend.total_month,
      );
      // send notification to user
      // send mail to user
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
