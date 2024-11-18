import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IExtendService } from './interfaces/IExtendService.interface';
import { CreateExtendDto } from './dto/create-extend.dto';
import { BookingsService } from '../bookings/bookings.service';
import { BookingLand } from '../bookings/entities/bookingLand.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Extend } from './entities/extend.entity';
import { Repository } from 'typeorm';
import { BookingStatus } from '../bookings/types/booking-status.enum';
import { ExtendStatus } from './types/extend-status.enum';

@Injectable()
export class ExtendsService implements IExtendService {
  constructor(
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingLandService: BookingsService,

    @InjectRepository(Extend)
    private readonly extendRepository: Repository<Extend>,
  ) {}

  async createExtend(createExtendDTO: CreateExtendDto): Promise<any> {
    try {
      if (
        createExtendDTO.status !== ExtendStatus.pending_contract &&
        createExtendDTO.status !== ExtendStatus.pending
      ) {
        throw new BadRequestException('Status is invalid');
      }
      // Get booking land by id
      const bookingLand: BookingLand =
        await this.bookingLandService.getBookingDetail(
          createExtendDTO.booking_land_id,
        );
      if (bookingLand.status !== BookingStatus.completed) {
        throw new BadRequestException('Booking is not paid yet');
      }
      // get time end by plus month
      const time_end = new Date(
        new Date(bookingLand.time_end).setMonth(
          new Date(bookingLand.time_end).getMonth() +
            createExtendDTO.total_month,
        ),
      );
      // check exist booking land in time
      const checkExistBookingLand: BookingLand[] =
        await this.bookingLandService.checkExistBookingByTimeAndLand(
          bookingLand.booking_id,
          bookingLand.land_id,
          time_end,
        );
      if (checkExistBookingLand.length > 0) {
        throw new BadRequestException(
          `Land is already booked in ${checkExistBookingLand[0].time_end}`,
        );
      }
      // create extend
      const extend = await this.extendRepository.save({
        booking_land_id: bookingLand.booking_id,
        total_month: createExtendDTO.total_month,
        time_start: bookingLand.time_end,
        price_per_month: bookingLand.land.price_booking_per_month,
      });
      return extend;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
