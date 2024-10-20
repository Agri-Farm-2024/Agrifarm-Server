import { Payload } from 'src/modules/auths/types/payload.type';

export interface IBookingService {
  createBooking(createBookingDto: any, land_renter: Payload): Promise<any>;

  updateStatusBooking(bookingId: string, data: any): Promise<any>;
}
