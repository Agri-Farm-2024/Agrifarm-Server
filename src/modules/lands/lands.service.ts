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
import { IsNull, Like, Not, Repository } from 'typeorm';
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
import { Payload } from '../auths/types/payload.type';

@Injectable()
export class LandsService implements ILandService {
  constructor(
    @InjectRepository(Land)
    private readonly landRepo: Repository<Land>,

    @InjectRepository(LandType)
    private readonly landTypeRepo: Repository<LandType>,

    @InjectRepository(LandURL)
    private readonly landURLRepo: Repository<LandURL>,

    private readonly loggerService: LoggerService,

    private readonly userService: UsersService,
  ) {}

  async createLand(data: CreateLandDto): Promise<any> {
    try {
      //check if land name is already exist
      const land = await this.landRepo.findOne({
        where: {
          name: data.name,
        },
      });
      if (land) {
        throw new BadRequestException('Land name already exist');
      }
      //create new land
      const new_land = await this.landRepo.save({
        name: data.name,
        title: data.title,
        description: data.description,
        acreage_land: data.acreage_land,
        price_booking_per_month: data.price_booking_per_month,
      });
      // create url image
      if (data.images) {
        for (let i = 0; i < data.images.length; i++) {
          await this.landURLRepo.create({
            string_url: data.images[i],
            type: LandURLType.image,
            land_id: new_land.land_id,
          });
        }
      }
      // create url video
      if (data.videos) {
        for (let i = 0; i < data.videos.length; i++) {
          await this.landURLRepo.create({
            string_url: data.images[i],
            type: LandURLType.video,
            land_id: new_land.land_id,
          });
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

  /**
   * @function getListByLandrenter
   * @param status
   * @param pagination
   * @returns
   */

  async getListByLandrenter(
    status: LandStatus,
    pagination: PaginationParams,
    land_type_id: string,
  ): Promise<any> {
    try {
      console.log(pagination);
      // filter condition
      const filter_condition: any = {
        staff_id: Not(IsNull()),
      };
      if (status) {
        filter_condition.status = status;
      }
      if (pagination.search) {
        for (let i = 0; i < pagination.search.length; i++) {
          const search = pagination.search[i];
          filter_condition[search.field] = Like(search.value);
          if (!search.value) {
            delete filter_condition[search.field];
          }
        }
      }

      if (land_type_id) {
        filter_condition.land_type_id = land_type_id;
      }

      const [lands, total_count] = await Promise.all([
        this.landRepo.find({
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
          take: pagination.page_size,
        }),
        this.landRepo.count({
          where: filter_condition,
        }),
      ]);
      // Get total_page
      const total_page = Math.ceil(total_count / pagination.page_size);
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

  /**
   * @function getListLandByStaff
   * @param status
   * @param pagination
   * @returns
   */

  async getListLandByStaff(
    status: LandStatus,
    pagination: PaginationParams,
    user: Payload,
  ): Promise<any> {
    try {
      // filter condition
      const filter_condition: any = {};
      // check status
      if (status) {
        filter_condition.status = status;
      }
      // check user is staff
      if (user.role === UserRole.staff) {
        filter_condition.staff_id = user.user_id;
      }
      // check search
      if (pagination.search) {
        for (let i = 0; i < pagination.search.length; i++) {
          const search = pagination.search[i];
          filter_condition[search.field] = Like(search.value);
          if (!search.value) {
            delete filter_condition[search.field];
          }
        }
      }
      const [lands, total_count] = await Promise.all([
        this.landRepo.find({
          where: filter_condition,
          relations: {
            url: true,
            land_type: true,
          },
          select: {
            url: {
              string_url: true,
              type: true,
              land_url_id: true,
            },
          },
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.landRepo.count({
          where: filter_condition,
        }),
      ]);
      // Get total_page
      const total_page = Math.ceil(total_count / pagination.page_size);
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
      const lands = await this.landRepo.findOne({
        where: {
          land_id: id,
        },
        relations: {
          url: true,
          staff: true,
          booking_land: true,
          land_type: true,
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
      // check if land is exist
      const land = await this.landRepo.findOne({
        where: {
          land_id: id,
        },
      });
      if (!land) {
        throw new BadRequestException('Land not found');
      }
      // check name if exist
      if (data.name) {
        const land_name = await this.landRepo.findOne({
          where: {
            name: data.name,
            land_id: Not(id),
          },
        });
        if (land_name) {
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
      // convert data not include url and url_deleted
      const data_update_land = {
        name: data.name,
        title: data.title,
        description: data.description,
        acreage_land: data.acreage_land,
        price_booking_per_month: data.price_booking_per_month,
        staff_id: data.staff_id,
      };
      // update land
      const updated_land = await this.landRepo.save({
        ...land,
        ...data_update_land,
      });
      // update url of land
      if (data.url) {
        for (let i = 0; i < data.url.length; i++) {
          const url = data.url[i];
          if (url.land_url_id === null) {
            // create new url
            await this.landURLRepo.save({
              string_url: url.string_url,
              type: url.type,
              land_id: id,
            });
          } else {
            // update url
            await this.landURLRepo.update(url.land_url_id, {
              string_url: url.string_url,
              type: url.type,
              land_id: id,
            });
          }
        }
        // delete url
        if (data.url_deleted) {
          for (let i = 0; i < data.url_deleted.length; i++) {
            await this.landURLRepo.delete(data.url_deleted[i].land_url_id);
          }
        }
      }
      // Send mail to staff
      // Log the land update
      this.loggerService.log(`Land ${data.name} is updated`);

      return updated_land;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggerService.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateLandStatus(id: string, status: LandStatus): Promise<any> {
    try {
      const land = await this.landRepo.findOne({
        where: {
          land_id: id,
        },
      });
      if (!land) {
        throw new BadRequestException('Land not found');
      }
      const updated_land = await this.landRepo.save({
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
      const land_types = await this.landTypeRepo.find();
      return land_types;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //create landType
  async createLandType(data: any): Promise<any> {
    try {
      //check if land type is already exist
      const land_type = await this.landTypeRepo.findOne({
        where: {
          name: data.name,
        },
      });
      if (land_type) {
        throw new BadRequestException('Land type already exist');
      }
      //create new land type
      const new_land_type = await this.landTypeRepo.save({
        name: data.name,
        description: data.description,
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
      const land_type = await this.landTypeRepo.findOne({
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
      return await this.landTypeRepo.save(land_type);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //delete landType
  async deleteLandType(id: string): Promise<any> {
    try {
      //check if land type is already exist
      const land_type = await this.landTypeRepo.findOne({
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
      return await this.landTypeRepo.save(land_type);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
