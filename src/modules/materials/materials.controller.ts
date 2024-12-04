import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BuyMaterialDTO } from './dto/buy-material.dto';
import { MaterialType } from './types/material-type.enum';
import { RentMaterialDto } from './dto/rent-material.dto';
import { BookingMaterialStatus } from './types/booking-material-status.enum';
import { UpdateBookingMaterialDTO } from './dto/update-booking.material.dto';

@ApiTags('Material')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('/buyMaterial')
  @ApiBody({ type: [BuyMaterialDTO] })
  @UseGuards(AuthGuard)
  @Roles(UserRole.land_renter)
  buyMaterial(
    @Body() buyMaterialDTO: BuyMaterialDTO[],
    @Request() request: any,
  ) {
    const user = request['user'];
    return this.materialsService.buyMaterial(buyMaterialDTO, user);
  }

  @Post('/createMaterial')
  @UseGuards(AuthGuard)
  @Roles(UserRole.manager)
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.createMaterial(createMaterialDto);
  }

  @Put('/updateMaterial/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.manager)
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.updateMaterial(id, updateMaterialDto);
  }

  @ApplyPaginationMetadata
  @ApiQuery({ name: 'material_type', required: false, enum: MaterialType })
  @Get('/getALlMaterial')
  getMaterials(
    @Pagination() pagination: PaginationParams,
    @Query('material_type') type: MaterialType,
  ): Promise<any> {
    return this.materialsService.getMaterials(pagination, type);
  }

  @Post('/bookingMaterial')
  @UseGuards(AuthGuard)
  @Roles(UserRole.land_renter)
  bookingMaterial(@Body() data: RentMaterialDto, @Request() request: any) {
    const user = request['user'];
    return this.materialsService.bookingMaterial(data, user);
  }

  @Get('/bookingMaterial')
  @ApplyPaginationMetadata
  @ApiQuery({ name: 'status', required: false, enum: BookingMaterialStatus })
  @UseGuards(AuthGuard)
  @Roles(UserRole.land_renter, UserRole.manager, UserRole.staff)
  getBookingMaterial(
    @Pagination() pagination: PaginationParams,
    @Request() request: any,
    @Query('status') status: BookingMaterialStatus,
  ) {
    const user = request['user'];
    return this.materialsService.getBookingMaterials(pagination, status, user);
  }

  @Patch('/updateBookingMaterialStatus/:booking_material_id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.manager, UserRole.staff)
  updateBookingMaterialStatus(
    @Param('booking_material_id') booking_material_id: string,
    @Body() data: UpdateBookingMaterialDTO,
    @Request() request: any,
  ) {
    const user = request['user'];
    return this.materialsService.updateBookingMaterialStatus(
      booking_material_id,
      data,
      user,
    );
  }
}
