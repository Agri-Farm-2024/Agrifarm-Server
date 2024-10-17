import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { ILandService } from './interfaces/ILandService.interface';
import { Land } from './entities/land.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { CreateLandSubDescriptionDTO } from './dto/create-land-sub-description.dto';
import { LandSubDescription } from './entities/landSubDescription.entity';
import { LandURL } from './entities/landURL.entity';
import { LandURLType } from './types/land-url-type.enum';

@Injectable()
export class LandsService implements ILandService {
  constructor(
    @InjectRepository(Land)
    private readonly landEntity: Repository<Land>,

    @InjectRepository(LandSubDescription)
    private readonly landSubDescriptionEntity: Repository<LandSubDescription>,

    @InjectRepository(LandURL)
    private readonly landURLEntity: Repository<LandURL>,

    private readonly loggerService: LoggerService,
  ) {}

  async createLand(data: CreateLandDto): Promise<any> {
    try {
      //check if land name is already exist
      const land = await this.landEntity.findOne({
        where: {
          name: data.name,
        },
      });
      if (land) {
        throw new BadRequestException('Land name already exist');
      }
      //create new land
      const new_land = await this.landEntity.save({
        name: data.name,
        title: data.title,
        description: data.description,
        acreage_land: data.acreage_land,
        price_booking_per_month: data.price_booking_per_month,
      });
      // create sub description
      if (data.sub_description) {
        for (let i = 0; i < data.sub_description.length; i++) {
          await this.createLandSubDescription(
            data.sub_description[i],
            new_land.id,
          );
        }
      }
      // create url image
      if (data.images) {
        for (let i = 0; i < data.images.length; i++) {
          await this.createURLLand(
            data.images[i],
            LandURLType.image,
            new_land.id,
          );
        }
      }
      // create url video
      if (data.videos) {
        for (let i = 0; i < data.images.length; i++) {
          await this.createURLLand(
            data.videos[i],
            LandURLType.video,
            new_land.id,
          );
        }
      }

      // Log the land creation
      this.loggerService.log('New land is created');
      return new_land;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createLandSubDescription(
    data: CreateLandSubDescriptionDTO,
    land_id: string,
  ): Promise<any> {
    try {
      const new_land_sub_description = await this.landSubDescriptionEntity.save(
        {
          ...data,
          land_id: land_id,
        },
      );

      return new_land_sub_description;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createURLLand(
    string_url: string,
    type: LandURLType,
    land_id: string,
  ): Promise<any> {
    try {
      const new_land_url = await this.landURLEntity.save({
        string_url: string_url,
        type: type,
        land_id: land_id,
      });

      return new_land_url;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<any> {
    try {
      const lands = await this.landEntity.find();
      return lands;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailLandById(id: string): Promise<any> {
    try {
      const lands = await this.landEntity.find({
        where: {
          id: id,
        },
        relations: ['sub_description', 'url', 'staff'],
        select: {
          sub_description: {
            sub_title: true,
            sub_description: true,
            id: true,
          },
          url: {
            string_url: true,
            type: true,
            id: true,
          },
          staff: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      });
      return lands;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
