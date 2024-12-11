import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ApplyPaginationMetadata, Pagination } from 'src/common/decorations/pagination.decoration';
import { CreatePlantSeasonDto } from './dto/create-plantSeason.dto';
import { StatusPlant } from './types/plant-status.enum';
import { UpdatePlantSeasonDto } from './dto/update-plantSeason.dto';

@ApiTags('Plants')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post('/createPlant')
  createPlant(@Body() createPlantDto: CreatePlantDto) {
    return this.plantsService.createPlant(createPlantDto);
  }

  @Post('/createPlantSeason')
  createPlantSeason(@Body() CreatePlantSeasonDto: CreatePlantSeasonDto) {
    return this.plantsService.createPlantSeason(CreatePlantSeasonDto);
  }

  @ApplyPaginationMetadata
  @ApiProperty({
    type: StatusPlant,
    description: 'Filter plants by status',
    required: false,
  })
  @ApiQuery({
    name: 'land_type_id',
    description: 'Filter plants by land type',
    required: false,
  })
  @Get('/')
  async getAllPlants(
    @Pagination() pagination: PaginationParams,
    @Query('land_type_id') land_type_id: string,
  ): Promise<any> {
    return await this.plantsService.getAllPlants(pagination, land_type_id);
  }

  @ApplyPaginationMetadata
  @ApiQuery({
    name: 'time_start',
    required: false,
    description: 'Filter plant seasons by time_start',
  })
  @ApiQuery({
    name: 'total_month',
    required: false,
    description: 'Filter plant seasons by total_months',
  })
  @Get('/plantSeasons')
  async getAllPlantSeasons(
    @Pagination() pagination: PaginationParams,
    @Query('time_start') time_start: number,
    @Query('total_month') total_month: number,
  ): Promise<any> {
    return await this.plantsService.getAllPlantSeasons(pagination, time_start, total_month);
  }

  @Patch('/updateplant/:id')
  async updatePlant(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return await this.plantsService.updatePlant(id, updatePlantDto);
  }

  @Put('/updatePlantSeason/:id')
  async updatePlantSeason(@Param('id') id: string, @Body() data: UpdatePlantSeasonDto) {
    return await this.plantsService.updatePlantSeason(id, data);
  }

  @Delete('deletePlant/:id')
  async remove(@Param('id') id: string) {
    return await this.plantsService.removePlant(id);
  }

  @Delete('deletePlantSeason/:id')
  async removePlantSeason(@Param('id') id: string) {
    return await this.plantsService.removePlantSeason(id);
  }
}
