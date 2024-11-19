import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { IMaterialService } from './interface/IMaterialService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Like, Not, Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';

import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Order } from '../orders/entities/order.entity';
import { Payload } from '../auths/types/payload.type';
import { OrdersService } from '../orders/orders.service';
import { MaterialType } from './types/material-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateTransactionDTO } from '../transactions/dto/create-transaction.dto';
import { TransactionPurpose } from '../transactions/types/transaction-purpose.enum';
import { BuyMaterialDTO } from './dto/buy-material.dto';
import { MaterialStatus } from './types/material-status.enum';

@Injectable()
export class MaterialsService implements IMaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialEntity: Repository<Material>,

    @Inject(forwardRef(() => OrdersService))
    private readonly orderService: OrdersService,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,
  ) {}

  async createMaterial(createMaterialDto: CreateMaterialDto) {
    try {
      //check material is exist
      const material = await this.materialEntity.findOne({
        where: {
          name: Like(createMaterialDto.name),
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
      const material_exist = await this.materialEntity.findOne({
        where: {
          material_id: id,
        },
      });
      if (!material_exist) {
        throw new BadRequestException('material not found');
      }
      //check name of material is duplicate
      const material_name = await this.materialEntity.findOne({
        where: {
          name: Like(updateMaterialDto.name),
          material_id: Not(id),
        },
      });
      if (material_name) {
        throw new BadRequestException('Material name already exist');
      }

      if (updateMaterialDto.total_quantity === 0) {
        material_exist.status = MaterialStatus.out_of_stock;
      }

      if (material_exist.status === MaterialStatus.out_of_stock) {
        if (updateMaterialDto.total_quantity > 0) {
          material_exist.status = MaterialStatus.available;
        }
      }

      return await this.materialEntity.save({
        ...material_exist,
        ...updateMaterialDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // update quantiy material for request material
  async updateQuantityMaterial(
    material: string,
    quantity: number,
  ): Promise<any> {
    try {
      const material_exist = await this.materialEntity.findOne({
        where: {
          material_id: material,
        },
      });

      if (material_exist.total_quantity + quantity <= 0) {
        material_exist.status = MaterialStatus.out_of_stock;
      }

      if (material_exist.total_quantity + quantity > 0) {
        material_exist.status = MaterialStatus.available;
      }

      const update_material = await this.materialEntity.save({
        ...material_exist,
        total_quantity: material_exist.total_quantity + quantity,
      });
      return update_material;
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

  async buyMaterial(materials: BuyMaterialDTO[], user: Payload): Promise<any> {
    try {
      // Create a new order for the transaction
      const newOrder: Order = await this.orderService.createOrder({
        landrenter_id: user.user_id,
      });
      // Caculate total_price for transaction
      let total_price = 0;
      // Loop through each material in the array
      for (const item of materials) {
        const { material_id, quantity } = item;

        // Check if the material exists
        const material = await this.materialEntity.findOne({
          where: { material_id },
        });
        if (!material) {
          // handle delete order
          await this.orderService.deleteOrder(newOrder.order_id);
          throw new BadRequestException(
            `Material with ID ${material_id} not found`,
          );
        }
        // check material is for buy
        if (material.type !== MaterialType.buy) {
          await this.orderService.deleteOrder(newOrder.order_id);

          throw new BadRequestException(
            `Material with ID ${material_id} is not for buy`,
          );
        }

        // Check if there is enough quantity
        if (material.total_quantity < quantity) {
          await this.orderService.deleteOrder(newOrder.order_id);

          throw new BadRequestException(
            `Not enough quantity for material ${material.name}`,
          );
        }
        // Create order detail
        await this.orderService.createOrderDetail({
          material_id: material_id,
          order_id: newOrder.order_id,
          quantity: quantity,
          price_per_iteam: material.price_per_piece,
        });
        // Update the quantity of the material
        await this.materialEntity.update(
          {
            material_id,
          },
          {
            total_quantity: material.total_quantity - quantity,
          },
        );
        // Calculate the total price
        total_price += material.price_per_piece * quantity;
      }
      // create transaction
      // create transaction DTO and create transaction
      const transactionData: Partial<CreateTransactionDTO> = {
        order_id: newOrder.order_id,
        total_price: total_price,
        purpose: TransactionPurpose.order,
        user_id: user.user_id,
      };

      const transaction = await this.transactionService.createTransaction(
        transactionData as CreateTransactionDTO,
      );
      return transaction;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleCancelOrder(material: string, quantity: number): Promise<any> {
    try {
      // update quantity material
      const materialEntity = await this.materialEntity.findOne({
        where: {
          material_id: material,
        },
      });
      if (!materialEntity) {
        throw new BadRequestException('Material not found');
      }
      await this.materialEntity.update(
        {
          material_id: material,
        },
        {
          total_quantity: materialEntity.total_quantity + quantity,
        },
      );
      return `Material ${materialEntity.name} is updated`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
