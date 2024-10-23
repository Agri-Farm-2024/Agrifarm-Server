import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusBookingDTO } from './dto/update-status-booking.dto';

@ApiTags('Booking')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() request: any,
  ): Promise<any> {
    return await this.bookingsService.createBooking(
      createBookingDto,
      request.user,
    );
  }

  @Get('/:booking_id')
  async getBookingDetail(
    @Param('booking_id') booking_id: string,
  ): Promise<any> {
    return await this.bookingsService.getBookingDetail(booking_id);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager)
  @Get('/')
  async getAllBooking(@Request() request: any): Promise<any> {
    return await this.bookingsService.getListBookingStrategy(request.user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager)
  @Put('/:booking_id')
  async updateBooking(
    @Param('booking_id') booking_id: string,
    @Body() data: UpdateStatusBookingDTO,
    @Request() request: any,
  ): Promise<any> {
    return await this.bookingsService.updateStatusBookingStrategy(
      booking_id,
      data,
      request.user,
    );
  }
}
