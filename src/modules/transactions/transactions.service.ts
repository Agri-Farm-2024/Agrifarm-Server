import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ITransactionService } from './interfaces/transaction.interface';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { BookingPaymentFrequency } from '../bookings/types/booking-payment.enum';
import { TransactionStatus } from './types/transaction-status.enum';
import { TransactionPurpose } from './types/transaction-purpose.enum';
import { Payload } from '../auths/types/payload.type';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { parsePaymentLink } from 'src/utils/payment-link.util';
import { ServicesService } from '../servicesPackage/servicesPackage.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class TransactionsService implements ITransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @Inject(forwardRef(() => BookingsService))
    private readonly bookingService: BookingsService,

    @Inject(forwardRef(() => ServicesService))
    private readonly servicePackageService: ServicesService,

    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,
  ) {}
  /**
   * @function createTransaction
   * @param data
   */

  async createTransaction(transactionDTO: CreateTransactionDTO): Promise<any> {
    try {
      // Generate transaction code 6 digits uppercase
      const transactionCode = this.generateTransactionCode();
      // check is duplicate transaction code
      const transaction_exist = await this.transactionRepository.findOne({
        where: { transaction_code: transactionCode },
      });
      if (transaction_exist) {
        return this.createTransaction(transactionDTO);
      }
      // create new transaction
      if (!transactionDTO.expired_at) {
        // set expired at 1 day
        transactionDTO.expired_at = new Date(
          new Date().setDate(new Date().getDate() + 1),
        );
      }
      // create new transaction
      const new_transaction = await this.transactionRepository.save({
        ...transactionDTO,
        transaction_code: transactionCode,
      });
      return new_transaction;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createTransactionPaymentBookingLand(booking_id: string): Promise<any> {
    try {
      // generate transaction code 6 digits uppercase
      const transaction_code = this.generateTransactionCode();
      // Check is duplicate transaction code
      const transaction_exist = await this.transactionRepository.findOne({
        where: { transaction_code: transaction_code },
      });
      if (transaction_exist) {
        return this.createTransactionPaymentBookingLand(booking_id);
      }
      // Get booking by id
      const booking: BookingLand =
        await this.bookingService.getBookingDetail(booking_id);
      // Get total price booking
      const total_price = this.getTotalPriceBooking(booking);
      // check frequency payment
      // if payment frequency is single
      if (booking.payment_frequency === BookingPaymentFrequency.single) {
        // Create transaction expired 1 day
        const new_transaction = this.transactionRepository.save({
          booking_land_id: booking_id,
          transaction_code,
          total_price,
          purpose: TransactionPurpose.booking_land,
          expired_at: new Date(new Date().setDate(new Date().getDate() + 1)),
          user_id: booking.landrenter_id,
        });
        return new_transaction;
      }
      // if payment frequency is multiple
      //Nếu thuê trên 1 năm sẽ lấy ⅔ phần tiền , ⅓ phần tiền còn lại sẽ lấy vào 10 ngày trước khi bắt đầu ⅓ thời gian còn lại
      if (booking.payment_frequency === BookingPaymentFrequency.multiple) {
        // create 1st transaction expired after 1 days
        const first_transaction = this.transactionRepository.save({
          booking_land_id: booking_id,
          transaction_code: transaction_code,
          total_price: Math.ceil((total_price * 2) / 3),
          purpose: TransactionPurpose.booking_land,
          expired_at: new Date(new Date().setDate(new Date().getDate() + 1)),
          status: TransactionStatus.approved,
          user_id: booking.landrenter_id,
        });
        // create 2st transaction expired after 10 days before booking end
        // generate new transaction code 6 digits uppercase
        const transaction_code_2 = this.generateTransactionCode();
        // check is duplicate transaction code
        const transaction_exist_2 = await this.transactionRepository.findOne({
          where: { transaction_code: transaction_code_2 },
        });
        if (transaction_exist_2) {
          return this.createTransactionPaymentBookingLand(booking_id);
        }
        // create 2nd transaction
        await this.transactionRepository.save({
          booking_land_id: booking_id,
          transaction_code: transaction_code_2,
          total_price: Math.ceil(total_price / 3),
          expired_at: new Date(
            new Date().setDate(booking.time_end.getDate() - 10),
          ),
          status: TransactionStatus.pending,
          user_id: booking.landrenter_id,
        });
        return first_transaction;
      }
    } catch (error) {}
  }

  /**
   * @function handlePayment
   * @param booking
   * @returns
   */

  async handleTransactionPayment(
    transaction_code: string,
    total_price: number,
  ): Promise<any> {
    try {
      // get transaction
      const transaction = await this.transactionRepository.findOne({
        where: {
          transaction_code: transaction_code,
        },
      });
      // check transaction exist
      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }
      // check transaction status
      if (transaction.status !== TransactionStatus.approved) {
        throw new BadRequestException('Transaction is not approved');
      }
      // check total price is valid
      if (total_price !== transaction.total_price) {
        throw new BadRequestException('Total price is not valid');
      }
      // update transaction status
      transaction.status = TransactionStatus.succeed;
      await this.transactionRepository.save(transaction);
      // handle business logic
      switch (transaction.purpose) {
        case TransactionPurpose.booking_land:
          return this.handlePaymentBookingLand(transaction);
        case TransactionPurpose.service:
          return this.servicePackageService.handlePaymentServiceSpecificSuccess(
            transaction,
          );
        default:
          return;
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async handlePaymentBookingLand(transaction: Transaction): Promise<any> {
    try {
      const update_booking =
        await this.bookingService.updateStatusToCompleted(transaction);
      // send order to land renter
      return update_booking;
    } catch (error) {}
  }

  async getListTransactionByUser(
    user: Payload,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      // get list transaction by user
      const [transactions, total_count] = await Promise.all([
        this.transactionRepository.find({
          relations: {
            booking_land: {
              land: true,
            },
          },
          where: {
            user_id: user.user_id,
          },
          take: pagination.page_size,
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.transactionRepository.count({
          where: {
            user_id: user.user_id,
          },
        }),
      ]);
      // add payment link to transaction
      transactions.forEach((transaction: any) => {
        transaction.payment_link = parsePaymentLink(
          transaction.total_price,
          transaction.transaction_code,
        );
      });
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        transactions,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailTransaction(transaction_id: string): Promise<any> {
    try {
      // get transaction by id
      const transaction: any = await this.transactionRepository.findOne({
        where: { transaction_id },
        relations: {
          booking_land: {
            land: true,
          },
          user: true,
          extend: true,
        },
        select: {
          user: {
            full_name: true,
            email: true,
            user_id: true,
          },
        },
      });
      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }
      // add payment link to transaction

      transaction.payment_link = parsePaymentLink(
        transaction.total_price,
        transaction.transaction_code,
      );

      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private getTotalPriceBooking(booking: BookingLand): number {
    // check payment frequency
    const total_price_booking: number =
      booking.total_month * booking.price_per_month;
    const total_price = total_price_booking + booking.price_deposit;
    return total_price;
  }

  private generateTransactionCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async cancelTransaction(transaction_id: string): Promise<any> {
    try {
      // get detail transaction
      const transaction = await this.transactionRepository.findOne({
        where: { transaction_id },
      });
      // check transaction exist
      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }
      // check transaction status
      if (transaction.status !== TransactionStatus.approved) {
        throw new BadRequestException('Transaction is not approved');
      }
      // check purpose transaction
      switch (transaction.purpose) {
        case TransactionPurpose.service:
          return await this.servicePackageService.cancelServiceSpecific(
            transaction.service_specific_id,
          );
        case TransactionPurpose.order:
          return await this.orderService.cancelOrder(transaction.order_id);
        default:
          return `Can't cancel transaction with purpose ${transaction.purpose}`;
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
