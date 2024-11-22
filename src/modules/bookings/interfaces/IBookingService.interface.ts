import { Payload } from 'src/modules/auths/types/payload.type';
import { UpdateStatusBookingDTO } from '../dto/update-status-booking.dto';
import { BookingLand } from '../entities/bookingLand.entity';
import { BookingStatus } from '../types/booking-status.enum';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Transaction } from 'src/modules/transactions/entities/transaction.entity';

export interface IBookingService {
  createBooking(createBookingDto: any, land_renter: Payload): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  getListBookingStrategy(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any>;

  getListBookingByManager(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any>;

  getListBookingByStaff(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any>;

  getListBookingByLandrenter(
    user: Payload,
    status: BookingStatus,
    type: string,
    pagination: PaginationParams,
  ): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  updateStatusBookingStrategy(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToPendingContract(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToPendingSign(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToPendingPayment(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToCompleted(transaction: Transaction): Promise<any>;

  updateStatusToRejected(
    booking_exist: BookingLand,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  checkExistBookingByTimeAndLand(
    booking_land_id: string,
    land_id: string,
    time_end: Date,
  ): Promise<any>;

  checkBookingIsExpired(): Promise<any>;

  updateBookingByExtend(booking_id: string, total_month: number): Promise<any>;

  createRefundBooking(booking_id: string): Promise<any>;

  updateBookingByReport(booking_id: string, data: any): Promise<any>;
}
