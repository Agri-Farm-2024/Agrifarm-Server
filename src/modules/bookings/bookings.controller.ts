import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusBookingDTO } from './dto/update-status-booking.dto';
import { BookingStatus } from './types/booking-status.enum';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

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
  @Roles(UserRole.admin, UserRole.manager, UserRole.land_renter, UserRole.staff)
  @Get('/')
  @ApplyPaginationMetadata
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'type', required: true, enum: ['request', 'booking'] })
  async getAllBooking(
    @Request() request: any,
    @Query('status') status: BookingStatus,
    @Query('type') type: string,
    @Pagination() pagination: PaginationParams,
  ): Promise<any> {
    return await this.bookingsService.getListBookingStrategy(
      request.user,
      status,
      type,
      pagination,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager, UserRole.land_renter, UserRole.staff)
  @Put('/:booking_id')
  async updateStatusBooking(
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
