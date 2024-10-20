import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookingService } from './interfaces/IBookingService.interface';

@Injectable()
export class BookingsService implements IBookingService {
  /**
   * @function createBooking
   * @param createBookingDto
   *
   * @returns
   */
  async createBooking(createBookingDto: CreateBookingDto): Promise<any> {
    return createBookingDto;
  }
}
