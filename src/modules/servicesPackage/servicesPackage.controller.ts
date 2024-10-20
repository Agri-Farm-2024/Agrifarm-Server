import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './servicesPackage.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateServicePackageDTO } from './dto/create-service-package.dto';

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
}
