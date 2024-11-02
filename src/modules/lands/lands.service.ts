import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDTO } from './dto/update-land.dto';
import { ILandService } from './interfaces/ILandService.interface';
import { Land } from './entities/land.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LandURL } from './entities/landURL.entity';
import { LandURLType } from './types/land-url-type.enum';
import { LandStatus } from './types/land-status.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/types/user-role.enum';
import { LandType } from './entities/landType.entity';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { LandTypeStatus } from './types/landType-status.enum';
import { parseUrlLink } from 'src/utils/parse-url-link.util';

@Injectable()
export class LandsService implements ILandService {
  constructor(
    @InjectRepository(Land)
    private readonly landEntity: Repository<Land>,

    @InjectRepository(LandType)
    private readonly landTypeEntity: Repository<LandType>,

    @InjectRepository(LandURL)
    private readonly landURLEntity: Repository<LandURL>,

    private readonly loggerService: LoggerService,

    private readonly userService: UsersService,
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
      // create url image
      if (data.images) {
        for (let i = 0; i < data.images.length; i++) {
          await this.createURLLand(
            data.images[i],
            LandURLType.image,
            new_land.land_id,
          );
        }
      }
      // create url video
      if (data.videos) {
        for (let i = 0; i < data.images.length; i++) {
          await this.createURLLand(
            data.videos[i],
            LandURLType.video,
            new_land.land_id,
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

  async findAll(
    status: LandStatus,
    pagination: PaginationParams,
  ): Promise<any> {
    try {
      // filter condition
      const filter_condition: any = {};
      if (status) {
        filter_condition.status = status;
      }
      const [lands, total_count] = await Promise.all([
        this.landEntity.find({
          where: filter_condition,
          relations: {
            url: true,
          },
          select: {
            url: {
              string_url: true,
              type: true,
              land_url_id: true,
            },
          },
          skip: (pagination.page_index - 1) * pagination.page_size,
        }),
        this.landEntity.count({
          where: filter_condition,
        }),
      ]);
      // Get total_page
      const total_page = Math.ceil(total_count / pagination.page_size);
      // // parse url link of string url
      // lands.forEach((land) => {
      //   land.url.forEach((url) => {
      //     url.string_url = parseUrlLink(url.string_url);
      //   });
      // });
      return {
        lands,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailLandById(id: string): Promise<any> {
    try {
      const lands = await this.landEntity.findOne({
        where: {
          land_id: id,
        },
        relations: {
          url: true,
          staff: true,
        },
        select: {
          url: {
            string_url: true,
            type: true,
            land_url_id: true,
          },
          staff: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      });
      if (!lands) {
        throw new BadRequestException('Land not found');
      }
      return lands;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @function updateLand
   * @param data
   * @param id
   * @returns
   */

  async updateLand(data: UpdateLandDTO, id: string): Promise<any> {
    try {
      const land = await this.landEntity.findOne({
        where: {
          land_id: id,
        },
      });
      if (!land) {
        throw new BadRequestException('Land not found');
      }
      // check name if exist
      if (data.name) {
        const land_name = await this.landEntity.findOne({
          where: {
            name: data.name,
          },
        });
        if (land_name && land_name.land_id !== id) {
          throw new BadRequestException('Land name already exist');
        }
      }
      // check if data have staff_id
      if (data.staff_id) {
        // check if staff_id is exist
        const staff_exist: User = await this.userService.findUserById(
          data.staff_id,
        );
        if (staff_exist.role !== UserRole.staff) {
          throw new BadRequestException('User is not staff');
        }
      }
      // update land
      const updated_land = await this.landEntity.save({
        ...land,
        ...data,
      });
      // Send mail to staff
      // Log the land update
      this.loggerService.log('Land is updated');

      return updated_land;
    } catch (error) {
      LoggerService.error(error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateLandStatus(id: string, status: LandStatus): Promise<any> {
    try {
      const land = await this.landEntity.findOne({
        where: {
          land_id: id,
        },
      });
      if (!land) {
        throw new BadRequestException('Land not found');
      }
      const updated_land = await this.landEntity.save({
        ...land,
        status: status,
      });

      return updated_land;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //getlandType
  async getLandType(): Promise<any> {
    try {
      //get all land type
      const land_types = await this.landTypeEntity.find();
      return land_types;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //create landType
  async createLandType(data: any): Promise<any> {
    try {
      //check if land type is already exist
      const land_type = await this.landTypeEntity.findOne({
        where: {
          name: data.name,
        },
      });
      if (land_type) {
        throw new BadRequestException('Land type already exist');
      }
      //create new land type
      const new_land_type = await this.landTypeEntity.save({
        name: data.name,
      });

      return new_land_type;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  //update landType
  async updateLandType(data: any, id: string): Promise<LandType> {
    try {
      //check if land type is already exist
      const land_type = await this.landTypeEntity.findOne({
        where: {
          land_type_id: id,
        },
      });
      if (!land_type) {
        throw new BadRequestException('Land type not found');
      }
      //update land type
      land_type.name = data.name;
      land_type.description = data.description;
      return await this.landTypeEntity.save(land_type);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //delete landType
  async deleteLandType(id: string): Promise<any> {
    try {
      //check if land type is already exist
      const land_type = await this.landTypeEntity.findOne({
        where: {
          land_type_id: id,
        },
      });
      if (!land_type) {
        throw new BadRequestException('Land type not found');
      }
      //delete land type
      land_type.status = LandTypeStatus.inactive;

      this.loggerService.log('Land type is deleted');
      return await this.landTypeEntity.save(land_type);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
