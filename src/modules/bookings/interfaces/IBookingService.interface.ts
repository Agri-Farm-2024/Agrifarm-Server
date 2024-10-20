export interface IBookingService {
  createBooking(createBookingDto: any): Promise<any>;
}
