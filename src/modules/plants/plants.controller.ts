import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Put,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
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
  @Get('/')
  async getAllPlants(@Pagination() pagination: PaginationParams): Promise<any> {
    Logger.log('Get all plants');
    return await this.plantsService.getAllPlants(pagination);
  }

  @ApplyPaginationMetadata
  @Get('/plantSeasons')
  async getAllPlantSeasons(
    @Pagination() pagination: PaginationParams,
  ): Promise<any> {
    Logger.log('Get all plant seasons');
    return await this.plantsService.getAllPlantSeasons(pagination);
  }

  @Patch('/updateplant/:id')
  async updatePlant(
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return await this.plantsService.updatePlant(id,updatePlantDto);
  }

  @Put('/updatePlantSeason/:id')
  async updatePlantSeason(
    @Param('id') id: string,
    @Body() data: UpdatePlantSeasonDto,
  ) {
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
