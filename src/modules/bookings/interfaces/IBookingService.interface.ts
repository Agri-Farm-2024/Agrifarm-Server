import { Payload } from 'src/modules/auths/types/payload.type';
import { UpdateStatusBookingDTO } from '../dto/update-status-booking.dto';
import { BookingLand } from '../entities/bookingLand.entity';

export interface IBookingService {
  createBooking(createBookingDto: any, land_renter: Payload): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  getListBookingStrategy(user: Payload): Promise<any>;

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

  updateStatusToCompleted(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToExpired(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;

  updateStatusToCanceled(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;
}
