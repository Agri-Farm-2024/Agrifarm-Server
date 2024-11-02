import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDTO } from './dto/update-land.dto';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LandStatus } from './types/land-status.enum';
import { CreateLandTypeDto } from './dto/create-landType.dto';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

@ApiTags('Land')
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Get('/landType')
  async getLandType() {
    return await this.landsService.getLandType();
  }

  @Post('/createLand')
  create(@Body() createLandDto: CreateLandDto) {
    return this.landsService.createLand(createLandDto);
  }

  @ApiQuery({
    enum: LandStatus,
    description: 'Get all lands by status',
    required: false,
    name: 'status',
  })
  @Get()
  @ApplyPaginationMetadata
  findAll(
    @Query('status') status: LandStatus,
    @Pagination() pagination: PaginationParams,
  ) {
    return this.landsService.findAll(status, pagination);
  }

  @Get('/:land_id')
  findOne(@Param('land_id') id: string) {
    return this.landsService.getDetailLandById(id);
  }

  @Put('/:land_id')
  update(@Param('land_id') id: string, @Body() updateLandDto: UpdateLandDTO) {
    return this.landsService.updateLand(updateLandDto, id);
  }

  @Post('/createLandType')
  createLandType(@Body() CreateLandTypeDto: CreateLandTypeDto) {
    return this.landsService.createLandType(CreateLandTypeDto);
  }

  @Put('/updateLandType/:id')
  updateLandType(
    @Param('id') id: string,
    @Body() updateLandTypeDto: CreateLandTypeDto,
  ) {
    return this.landsService.updateLandType(updateLandTypeDto, id);
  }
  @Delete('/deleteLandType/:id')
  deleteLandType(@Param('id') id: string) {
    return this.landsService.deleteLandType(id);
  }
}
