import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';

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

  // @UseGuards(AuthGuard)
  // @Roles(UserRole.admin, UserRole.manager)
  // @Get('/getAllBooking')
  // async getAllBooking(): Promise<any> {
  //   return await this.bookingsService.getAllBooking();
  // }
}
