import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Plant } from './entities/plant.entity';
import { IPlantService } from './interfaces/IPlantService.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { PlantSeason } from './entities/plantSeason';
import { CreatePlantSeasonDto } from './dto/create-plantSeason.dto';
import { StatusPlant } from './types/plant-status.enum';

@Injectable()
export class PlantsService implements IPlantService {
  constructor(
    @InjectRepository(Plant)
    private readonly plantEntity: Repository<Plant>,
    private readonly loggerService: LoggerService,
    @InjectRepository(PlantSeason)
    private readonly plantSeasonEntity: Repository<PlantSeason>,
    private readonly logger: LoggerService,
  ) {}

  async create(createPlantDto: CreatePlantDto) {
    //create new plant
    const new_plant = await this.plantEntity.save({
      ...createPlantDto,
    });

    // Log the plant creation
    this.loggerService.log('New plant is created');
    return new_plant;
  }

  async createPlantSeason(data: CreatePlantSeasonDto) {
    try {
      // check if plant_id and month_start and type is already exist
      const plant_season = await this.plantSeasonEntity.findOne({
        where: {
          plant_id: data.plant_id,
          month_start: data.month_start,
          type: data.type,
        },
      });
      if (plant_season) {
        throw new BadRequestException('Plant season already exist');
      }
      //create new plant season
      const new_plant_season = await this.plantSeasonEntity.save({
        ...data,
      });

      // Log the plant season creation
      this.loggerService.log('New plant season is created');
      return new_plant_season;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  findAll() {
    return `This action returns all plants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plant`;
  }

  async updatePlant(id: string, status: StatusPlant): Promise<Plant> {
    try {
      const plant = await this.plantEntity.findOne({
        where: {
          id: id,
        },
      });
      if (!plant) {
        throw new BadRequestException('Plant not found');
      }

      plant.status = status;
      return await this.plantEntity.save(plant);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePlantSeason(id: string, data: any): Promise<PlantSeason> {
    //update plant season
    try {
      const plant_season = await this.plantSeasonEntity.findOne({
        where: {
          id: id,
        },
      });
      if (!plant_season) {
        throw new BadRequestException('Plant season not found');
      }
      //update plant season
      plant_season.month_start = data.month_start;
      plant_season.type = data.type;
      plant_season.price_purchase_per_kg = data.price_purchase_per_kg;
      plant_season.price_process = data.price_process;

      return await this.plantSeasonEntity.save(plant_season);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePlant(id: string): Promise<void> {
    //delete plant
    try {
      const plant = await this.plantEntity.findOne({
        where: { id },
      });
      if (!plant) {
        throw new NotFoundException(`Plant with ID ${id} not found`);
      }

      // Delete the plant
      await this.plantEntity.remove(plant);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPlants(pagination: PaginationParams): Promise<any> {
    //get all plant
    Logger.log('Get all plants');
    const [plants, total_count] = await Promise.all([
      this.plantEntity.find({
        skip: (pagination.page_index - 1) * pagination.page_size,
        take: pagination.page_size,
      }),
      this.plantEntity.count({}),
    ]);

    // get total page
    const total_page = Math.ceil(total_count / pagination.page_size);
    return {
      plants,
      pagination: {
        ...pagination,
        total_page,
      },
    };
  }

  async getAllPlantSeasons(pagination: PaginationParams): Promise<any> {
    try {
      //get all plant season
      Logger.log('Get all plant seasons');
      const [plant_seasons, total_count] = await Promise.all([
        this.plantSeasonEntity.find({
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
          relations: ['plant'],
          select: {
            plant: {
              name: true,
            },
          },
        }),
        this.plantSeasonEntity.count({}),
      ]);

      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        plant_seasons,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
