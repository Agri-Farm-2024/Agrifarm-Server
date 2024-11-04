import { Injectable } from '@nestjs/common';
import { ITransactionService } from './interfaces/transaction.interface';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { BookingPaymentFrequency } from '../bookings/types/booking-payment.enum';
import { TransactionStatus } from './types/transaction-status.enum';

@Injectable()
export class TransactionsService implements ITransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly bookingService: BookingsService,
  ) {}
  /**
   * @function createTransaction
   * @param data
   */

  async createTransaction(transactionDTO: CreateTransactionDTO): Promise<any> {
    try {
      // Generate transaction code 6 digits uppercase
      const transactionCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      // check is duplicate transaction code
      const transaction_exist = await this.transactionRepository.findOne({
        where: { transaction_code: transactionCode },
      });
      if (transaction_exist) {
        return this.createTransaction(transactionDTO);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createTransactionPaymentBookingLand(booking_id: string): Promise<any> {
    try {
      // generate transaction code 6 digits uppercase
      const transaction_code = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
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
          booking_id,
          transaction_code,
          total_price,
          expired_at: new Date(new Date().setDate(new Date().getDate() + 1)),
        });
        return new_transaction;
      }
      // if payment frequency is multiple
      //Nếu thuê trên 1 năm sẽ lấy ⅔ phần tiền , ⅓ phần tiền còn lại sẽ lấy vào 10 ngày trước khi bắt đầu ⅓ thời gian còn lại
      if (booking.payment_frequency === BookingPaymentFrequency.multiple) {
        // create 1st transaction expired after 1 days
        const first_transaction = this.transactionRepository.save({
          bookging_id: booking_id,
          transaction_code: transaction_code,
          total_price: (total_price * 2) / 3,
          expired_at: new Date(new Date().setDate(new Date().getDate() + 1)),
          status: TransactionStatus.pending,
        });
      }
    } catch (error) {}
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
