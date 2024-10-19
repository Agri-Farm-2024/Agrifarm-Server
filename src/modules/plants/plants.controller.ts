import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
  Put,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { CreatePlantSeasonDto } from './dto/create-plantSeason.dto';

@ApiTags('Plants')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post('/createPlant')
  createPlant(@Body() createPlantDto: CreatePlantDto) {
    return this.plantsService.create(createPlantDto);
  }

  @Post('/createPlantSeason')
  createPlantSeason(@Body() CreatePlantSeasonDto: CreatePlantSeasonDto) {
    return this.plantsService.createPlantSeason(CreatePlantSeasonDto);
  }

  // @Get()
  // async findAll() {
  //   return await this.plantsService.findAll();
  // }

  @ApplyPaginationMetadata
  @Get('/plant')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(+id);
  }

  @Patch(':id')
  async updatePlant(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return  await this.plantsService.updatePlant(id, updatePlantDto.status);
  }

  @Put('/updatePlantSeason/:id')
  async updatePlantSeason(
    @Param('id') id: string,
    @Body() data: CreatePlantSeasonDto,
  ) {
    return await this.plantsService.updatePlantSeason(id, data);
  }

  @Delete('/plant/:id')
 async remove(@Param('id') id: string) {
    return await this.plantsService.removePlant(id);
  }

}
