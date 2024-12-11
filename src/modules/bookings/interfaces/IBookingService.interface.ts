import { IUser } from 'src/modules/auths/interfaces/IUser.interface';
import { UpdateStatusBookingDTO } from '../dto/update-status-booking.dto';
import { BookingLand } from '../entities/bookingLand.entity';
import { BookingStatus } from '../types/booking-status.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';

export interface IBookingService {
  createBooking(createBookingDto: any, land_renter: IUser): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  getListBooking(
    user: IUser,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  updateStatusBookingStrategy(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: IUser,
  ): Promise<any>;

  updateStatusToPendingContract(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: IUser,
  ): Promise<any>;

  updateStatusToPendingSign(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: IUser,
  ): Promise<any>;

  updateStatusToPendingPayment(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: IUser,
  ): Promise<any>;

  updateStatusToCompleted(transaction: Transaction): Promise<any>;

  updateStatusToRejected(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: IUser,
  ): Promise<any>;

  checkExistBookingByTimeAndLand(
    booking_land_id: string,
    land_id: string,
    time_end: Date,
  ): Promise<any>;

  checkBookingIsExpired(): Promise<any>;

  updateBookingByExtend(booking_id: string, total_month: number): Promise<any>;

  createRefundBooking(booking: BookingLand): Promise<any>;

  updateBookingByReport(booking_id: string, data: any): Promise<any>;
}
