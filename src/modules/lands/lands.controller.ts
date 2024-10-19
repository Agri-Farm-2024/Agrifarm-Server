import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { ApiTags } from '@nestjs/swagger';
import { LandStatus } from './types/land-status.enum';

@ApiTags('Land')
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post('/createLand')
  create(@Body() createLandDto: CreateLandDto) {
    return this.landsService.createLand(createLandDto);
  }

  @Get()
  findAll(@Query('status') status: LandStatus) {
    return this.landsService.findAll(status);
  }

  @Get('/:land_id')
  findOne(@Param('land_id') id: string) {
    return this.landsService.getDetailLandById(id);
  }
}
