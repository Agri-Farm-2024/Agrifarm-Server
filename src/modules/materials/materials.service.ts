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

import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Order } from '../orders/entities/order.entity';
import { OrderDetail } from '../orders/entities/orderDetail.entity';
import { Payload } from '../auths/types/payload.type';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class MaterialsService implements IMaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialEntity: Repository<Material>,

    //call service order
    private readonly orderServicce: OrdersService,

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

  // Buy material

  async buyMaterial(
    materials: { material_id: string; quantity: number }[],
    user: Payload,
  ): Promise<any> {
    try {
      // Create a new order for the transaction
      const newOrder = await this.orderServicce.createOrder({
        landrenter_id: user.user_id,
      });
      this.loggerService.log('New order is created');

      // Initialize total order price
      let totalOrderPrice = 0;
      const orderDetails = [];

      // Loop through each material in the array
      for (const item of materials) {
        const { material_id, quantity } = item;

        // Check if the material exists
        const material = await this.materialEntity.findOne({
          where: { material_id },
        });
        if (!material) {
          throw new BadRequestException(
            `Material with ID ${material_id} not found`,
          );
        }

        // Check if there is enough quantity
        if (material.total_quantity < quantity) {
          throw new BadRequestException(
            `Not enough quantity for material ${material_id}`,
          );
        }

        // Calculate the total price for the current material
        const totalPrice = material.price_per_piece * quantity;
        totalOrderPrice += totalPrice;
        // Add material data to order details array
        orderDetails.push({
          material_id,
          quantity,
          price: totalPrice,
        });

        // Update material quantity
        material.total_quantity -= quantity;
        await this.materialEntity.save(material);
        this.loggerService.log(`Material ${material_id} quantity updated`);
      }
      const new_order_detail = await this.orderServicce.createOrderDetail({
        order_id: newOrder.order_id,
        materials: orderDetails,
        total_price: totalOrderPrice,
      });
      this.loggerService.log('New order detail is created');

      // Return the complete order with total price and details
      return new_order_detail;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
