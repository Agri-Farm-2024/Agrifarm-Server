import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Request,
  Query,
  Patch,
  Param,
  Put,
} from '@nestjs/common';
import { ServicesService } from './servicesPackage.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateServicePackageDTO } from './dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from './dto/create-service-specific.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ServiceSpecificStatus } from './types/service-specific-status.enum';
import { UpdateStatusUsedServiceSpecificDTO } from './dto/update-status-used-service-specific.dto';
import { updateServicePackageDTO } from './dto/update-service-package.dto';

@ApiTags('Service')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('/createServicePackage')
  async createServicePackage(@Body() data: CreateServicePackageDTO) {
    return this.servicesService.createServicePackage(data);
  }

  @Get('/getListServicePackages')
  async getListServicePackages() {
    return this.servicesService.getListServicePackages();
  }

  @UseGuards(AuthGuard)
  @Get('/getListServiceSpecific')
  @ApplyPaginationMetadata
  @ApiQuery({
    name: 'status',
    enum: ServiceSpecificStatus,
    required: false,
  })
  async getListServiceSpecific(
    @Pagination() pagination: PaginationParams,
    @Request() req: any,
    @Query('status') status: ServiceSpecificStatus,
  ) {
    const user = req['user'];
    return this.servicesService.getListServiceSpecific(
      pagination,
      user,
      status,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.land_renter)
  @Post('/buyServiceSpecific')
  async buyServiceSpecific(
    @Body() data: CreateServiceSpecificDTO,
    @Request() req: any,
  ) {
    const user = req['user'];
    return this.servicesService.buyServiceSpecific(data, user);
  }

  @Delete('/deleteServicePackage/:id')
  async deleteServicePackage(id: string) {
    return this.servicesService.deleteServicePackage(id);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.staff)
  @Patch('/updateToUsedServiceSpecific/:service_specific_id')
  async updateToUsedServiceSpecific(
    @Body() data: UpdateStatusUsedServiceSpecificDTO,
    @Request() req: any,
    @Param('service_specific_id') service_specific_id: string,
  ) {
    return this.servicesService.updateToUsedServiceSpecific(
      service_specific_id,
      data.contract_image,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.staff)
  @Put('/updateServicePackage/:service_specific_id')
  async updateServicePackage(
    @Body() data: updateServicePackageDTO,
    @Request() req: any,
    @Param('service_specific_id') service_specific_id: string,
  ) {
    return this.servicesService.updateServicePackage(service_specific_id, data);
  }
}
