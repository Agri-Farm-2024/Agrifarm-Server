import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { IMaterialService } from './interface/IMaterialService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
// import { Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

@Injectable()
export class MaterialsService implements IMaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialEntity: Repository<Material>,
    private readonly loggerService: LoggerService,
  ) {}

  async createMaterial(createMaterialDto: CreateMaterialDto) {
    try {
      //check material is exist
      const material = await this.materialEntity.findOne({
        where: {
          name: createMaterialDto.name,
        },
      });
      if (material) {
        throw new BadRequestException('Material name already exist');
      }
      //create new material
      const new_material = await this.materialEntity.save({
        ...createMaterialDto,
      });

      this.loggerService.log('New material is created');
      return new_material;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateMaterial(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    try {
      //check material is exist
      const material = await this.materialEntity.findOne({
        where: {
          material_id: id,
        },
      });
      if (!material) {
        throw new BadRequestException('material not found');
      }
      //update material
      material.name = updateMaterialDto.name;
      material.total_quantity = updateMaterialDto.total_quantity;
      material.price_per_piece = updateMaterialDto.price_per_piece;
      material.deposit_per_piece = updateMaterialDto.deposit_per_piece;
      material.image_material = updateMaterialDto.image_material;
      material.price_of_rent = updateMaterialDto.price_of_rent;
      material.type = updateMaterialDto.type;

      return await this.materialEntity.save(material);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //Get ALL materials
  async getMaterials(pagination: PaginationParams): Promise<any> {
    try {
      const [materials, total_count] = await Promise.all([
        this.materialEntity.find({
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.materialEntity.count({}),
      ]);

      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        materials,
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
