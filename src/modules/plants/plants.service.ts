import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { Like, Repository } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { IPlantService } from './interfaces/IPlantService.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { PlantSeason } from './entities/plantSeason.entity';
import { CreatePlantSeasonDto } from './dto/create-plantSeason.dto';
import { StatusPlant } from './types/plant-status.enum';
import { PlantSeasonStatus } from './types/plant-season-status.enum';

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

  async createPlant(createPlantDto: CreatePlantDto) {
    // check if plant name is already exist
    const plant = await this.plantEntity.findOne({
      where: {
        name: createPlantDto.name,
      },
    });
    if (plant) {
      throw new BadRequestException('Plant name already exist');
    }
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
      // Check for duplicate plant season with the same plant_id, month_start, and type
      const existingSeason = await this.plantSeasonEntity.findOne({
        where: {
          plant_id: data.plant_id,
          month_start: data.month_start,
          type: data.type,
        },
      });
      if (existingSeason) {
        throw new BadRequestException(
          'Plant season already exists with the same plant_id, month_start, and type',
        );
      }

      // Additional check for in_season and out_season limits
      const seasonTypeCount = await this.plantSeasonEntity.count({
        where: {
          plant_id: data.plant_id,
          type: data.type,
        },
      });

      if (data.type === 'in_season' && seasonTypeCount >= 1) {
        throw new BadRequestException(
          'Only one in-season is allowed per plant variety',
        );
      }

      if (data.type === 'out_season' && seasonTypeCount >= 2) {
        throw new BadRequestException(
          'Only two out-seasons are allowed per plant variety',
        );
      }

      // Create a new plant season if validations pass
      const newPlantSeason = await this.plantSeasonEntity.save({ ...data });

      // Log the plant season creation
      this.loggerService.log('New plant season is created');
      return newPlantSeason;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePlant(id: string, status: StatusPlant): Promise<Plant> {
    try {
      const plant = await this.plantEntity.findOne({
        where: {
          plant_id: id,
        },
      });
      if (!plant) {
        throw new BadRequestException('Plant not found');
      }
      //update plant status
      plant.land_type_id = plant.land_type_id;
      plant.name = plant.name;
      plant.status = status;
      return await this.plantEntity.save(plant);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePlantSeason(id: string, data: any): Promise<PlantSeason> {
    try {
      // Find the existing plant season by ID
      const plant_season = await this.plantSeasonEntity.findOne({
        where: { plant_season_id: id },
      });

      if (!plant_season) {
        throw new BadRequestException('Plant season not found');
      }

      // Check constraints based on type change
      if (data.type !== plant_season.type) {
        const seasonTypeCount = await this.plantSeasonEntity.count({
          where: {
            plant_id: plant_season.plant_id,
            type: data.type,
          },
        });

        if (data.type === 'in_season' && seasonTypeCount >= 1) {
          throw new BadRequestException(
            'Only one in-season is allowed per plant variety',
          );
        }

        if (data.type === 'out_season' && seasonTypeCount >= 2) {
          throw new BadRequestException(
            'Only two out-seasons are allowed per plant variety',
          );
        }
      }
      // Check for duplicates of plant_id, type, and month_start
      const duplicateSeason = await this.plantSeasonEntity.findOne({
        where: {
          plant_id: plant_season.plant_id,

          month_start: data.month_start,
          // Exclude the current record being updated
        },
      });

      if (duplicateSeason) {
        throw new BadRequestException(
          'A season already exists at month_start.',
        );
      }

      // Update plant season properties
      plant_season.month_start = data.month_start;
      plant_season.type = data.type;
      plant_season.price_purchase_per_kg = data.price_purchase_per_kg;
      plant_season.price_process = data.price_process;

      // Save the updated plant season
      return await this.plantSeasonEntity.save(plant_season);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePlant(id: string): Promise<any> {
    //delete plant
    try {
      const plant = await this.plantEntity.findOne({
        where: {
          plant_id: id,
        },
      });
      if (!plant) {
        throw new NotFoundException(`Plant with ID ${id} not found`);
      }

      // Delete the plant
      plant.status = StatusPlant.inactive;
      const update_plant = await this.plantEntity.save(plant);
      return update_plant;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removePlantSeason(id: string): Promise<void> {
    try {
      //check plant season
      const plant_season = await this.plantSeasonEntity.findOne({
        where: {
          plant_season_id: id,
        },
      });
      if (!plant_season) {
        throw new NotFoundException(`Plant season with ID ${id} not found`);
      }
      //delete plant season
      plant_season.status = PlantSeasonStatus.deleted;
      this.plantSeasonEntity.save(plant_season);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPlants(pagination: PaginationParams): Promise<any> {
    // check filter condition
    const filter_search = pagination.search.reduce((acc, searchItem) => {
      if (searchItem.field && searchItem.value) {
        acc[searchItem.field] = Like(`%${searchItem.value}%`);
      }
      return acc;
    }, {});
    // check condition by enum

    const filter = { ...filter_search };
    const [plants, total_count] = await Promise.all([
      this.plantEntity.find({
        relations: {
          land_type: true,
        },
        select: {
          land_type: {
            name: true,
            description: true,
          },
        },
        skip: (pagination.page_index - 1) * pagination.page_size,
        take: pagination.page_size,
        where: filter,
      }),
      this.plantEntity.count({
        where: filter,
      }),
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

  async getDetailPlantSeason(plant_season_id: string): Promise<any> {
    try {
      //get detail plant season
      const plant_season = await this.plantSeasonEntity.findOne({
        where: {
          plant_season_id,
        },
        relations: {
          plant: true,
        },
      });
      if (!plant_season) {
        throw new BadRequestException('Plant season not found');
      }
      return;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
