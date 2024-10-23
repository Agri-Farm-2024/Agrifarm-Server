import { Payload } from 'src/modules/auths/types/payload.type';
import { UpdateStatusBookingDTO } from '../dto/update-status-booking.dto';

export interface IBookingService {
  createBooking(createBookingDto: any, land_renter: Payload): Promise<any>;

  getBookingDetail(bookingId: string): Promise<any>;

  getListBookingStrategy(user: Payload): Promise<any>;

  updateStatusBookingStrategy(
    bookingId: string,
    data: UpdateStatusBookingDTO,
    user: Payload,
  ): Promise<any>;
}
