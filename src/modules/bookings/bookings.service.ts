import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IBookingService } from './interfaces/IBookingService.interface';
import { LandsService } from '../lands/lands.service';
import { Land } from '../lands/entities/land.entity';
import { LandStatus } from '../lands/types/land-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookindLand } from './entities/bookindLand.entity';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { BookingStatus } from './types/booking-status.enum';
import { Payload } from '../auths/types/payload.type';

@Injectable()
export class BookingsService implements IBookingService {
  constructor(
    @InjectRepository(BookindLand)
    private readonly bookingEntity: Repository<BookindLand>,

    private readonly landService: LandsService,
  ) {}
  /**
   * @function createBooking
   * @param createBookingDto
   *
   * @returns
   */
  async createBooking(
    createBookingDto: CreateBookingDto,
    land_renter: Payload,
  ): Promise<any> {
    try {
      // check land status is free
      const land: Land = await this.landService.getDetailLandById(
        createBookingDto.land_id,
      );
      if (land.status !== LandStatus.free) {
        throw new BadRequestException('Land is not free to book');
      }
      // Get price per month of land
      const total_price =
        land.price_booking_per_month * createBookingDto.total_month;
      // create time end booking equal time_start + total_month
      const time_end = new Date(createBookingDto.time_start);
      time_end.setMonth(time_end.getMonth() + createBookingDto.total_month);
      // check if already have booking in this time and status != pending and != reject
      const booking_exist = await this.bookingEntity.find({
        where: {
          land_id: createBookingDto.land_id,
          status: Not(In([BookingStatus.pending, BookingStatus.rejected])),
          time_end: LessThanOrEqual(createBookingDto.time_start),
        },
      });
      if (booking_exist.length > 0) {
        throw new BadRequestException('Land is already booked');
      }
      // create new booking
      const new_booking = await this.bookingEntity.save({
        ...createBookingDto,
        land_renter_id: land_renter.id,
        time_end: time_end,
        staff_id: land.staff_id,
        total_price: total_price,
        price_deposit: total_price * 0.1,
      });
      // send notification to staff and land renter
      // create mail confirm for land renter
      // update land status to booked
      await this.landService.updateLandStatus(land.id, LandStatus.booked);
      return new_booking;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateStatusBooking
   * @param bookingId
   *
   * @returns
   */

  async updateStatusBooking(bookingId: string, data: any): Promise<any> {
    return data;
  }
}
