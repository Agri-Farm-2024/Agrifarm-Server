import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
        //create new land
        const new_land = this.landEntity.save({
          ...data,
        });

        // Log the land creation
        this.loggerService.log('New land is created');
        return new_land;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  findAll() {
    return `This action returns all lands`;
  }

  findOne(id: number) {
    return `This action returns a #${id} land`;
  }

  update(id: number, updateLandDto: UpdateLandDto) {
    return `This action updates a #${id} land`;
  }

  remove(id: number) {
    return `This action removes a #${id} land`;
  }
}
