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
import { IUser } from '../auths/types/IUser.interface';
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

      this.loggerService.log(
        `New material is created with ${new_material.name}`,
      );
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
  async getMaterials(
    pagination: PaginationParams,
    type: MaterialType,
  ): Promise<any> {
    try {
      // filter condition
      const filter: any = {};
      if (type) {
        filter.type = type;
      }
      const [materials, total_count] = await Promise.all([
        this.materialEntity.find({
          where: filter,
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.materialEntity.count({
          where: filter,
        }),
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

  async buyMaterial(materials: BuyMaterialDTO[], user: IUser): Promise<any> {
    try {
      // check material is have enough quantity
      if (materials.length === 0) {
        throw new BadRequestException('Material is empty');
      }
      // Loop through each material in the array
      for (const material of materials) {
        const material_detail = await this.materialEntity.findOne({
          where: {
            material_id: material.material_id,
          },
        });
        // check exist material
        if (!material_detail) {
          throw new BadRequestException('Material not found');
        }
        // check type of material is buy
        if (material_detail.type !== MaterialType.buy) {
          throw new BadRequestException('Material is not for buy');
        }
        // check quantity of material
        if (material_detail.total_quantity < material.quantity) {
          throw new BadRequestException(
            `Not enough quantity for material ${material_detail.name}`,
          );
        }
      }
      // Create a new order for the transaction
      const newOrder: Order = await this.orderService.createOrder({
        landrenter_id: user.user_id,
      });
      // Caculate total_price for transaction
      let total_price = 0;
      // Loop through each material in the array
      for (const item of materials) {
        // Check if the material exists
        const material_detail = await this.materialEntity.findOne({
          where: {
            material_id: item.material_id,
          },
        });
        // Create order detail
        await this.orderService.createOrderDetail({
          material_id: item.material_id,
          order_id: newOrder.order_id,
          quantity: item.quantity,
          price_per_iteam: material_detail.price_per_piece,
        });
        // Update the quantity of the material
        await this.materialEntity.update(
          {
            material_id: item.material_id,
          },
          {
            total_quantity: material_detail.total_quantity - item.quantity,
          },
        );
        // Calculate the total price
        total_price += material_detail.price_per_piece * item.quantity;
      }
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

  /**
   * Update back quantity when cancel order
   * @function handleCancelOrder
   * @param material
   * @param quantity
   * @returns
   */

  async handleCancelOrder(material: string, quantity: number): Promise<void> {
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
      this.loggerService.log(
        `Material ${materialEntity.name} is updated quantity when cancel order`,
      );
    } catch (error) {
      this.loggerService.error(error.message, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
