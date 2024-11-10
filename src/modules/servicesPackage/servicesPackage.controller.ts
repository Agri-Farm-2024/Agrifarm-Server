import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './servicesPackage.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateServicePackageDTO } from './dto/create-service-package.dto';
import { CreateServiceSpecificDTO } from './dto/create-service-specific.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';

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
}
