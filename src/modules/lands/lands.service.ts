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
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LandsService implements ILandService {
  constructor(
    @InjectRepository(Land)
    private readonly landEntity: Repository<Land>,
    private readonly loggerService: LoggerService,
  ) {}

  createLand(data: CreateLandDto) {
    try {
      //check if land name is already exist
      const land = this.landEntity.findOne({
        where: {
          name: data.name,
        },
      });
      if (land) {
        throw new InternalServerErrorException('Land name already exist');
      }
      //create new land
      const new_land = this.landEntity.save({
        ...data,
      });

      // Log the land creation
      this.loggerService.log('New land is created');
      return new_land;
    } catch (error) {
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
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
