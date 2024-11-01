import { Injectable } from '@nestjs/common';
import { ITransactionService } from './interfaces/transaction.interface';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { BookingPaymentFrequency } from '../bookings/types/booking-payment.enum';

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

  async createTransactionBooking(
    transactionDTO: CreateTransactionDTO,
    transaction_code: string,
  ): Promise<any> {
    try {
      // check booking_id is exist
      const booking_exist: BookingLand =
        await this.bookingService.getBookingDetail(transactionDTO.booking_id);
      // Get total price booking
      const total_price: number = this.getTotalPriceBooking(booking_exist);
      // Payment is single
      if (booking_exist.payment_frequency === BookingPaymentFrequency.single) {
        // Expired_at after 1 day
        const new_transaction = await this.transactionRepository.save({
          booking_id: transactionDTO.booking_id,
          transaction_code: transaction_code,
          total_price: total_price,
          expired_at: new Date(new Date().setDate(new Date().getDate() + 1)),
        });
        return new_transaction;
      } else if (
        booking_exist.payment_frequency === BookingPaymentFrequency.multiple
      ) {
        // get total_month
        const total_month: number =
          booking_exist.time_end.getMonth() -
          booking_exist.time_start.getMonth() +
          1;
      }
    } catch (error) {}
  }

  private getTotalPriceBooking(booking: BookingLand): number {
    const total_price_booking: number =
      (booking.time_end.getMonth() - booking.time_start.getMonth() + 1) *
      booking.price_per_month;
    const total_price = total_price_booking + booking.price_deposit;
    return total_price;
  }
}
