import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrdersService } from './interfaces/IOrderService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { OrderDetail } from './entities/orderDetail.entity';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { MaterialsService } from '../materials/materials.service';
import { IUser } from '../auths/interfaces/IUser.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../users/types/user-role.enum';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,

    private readonly loggerService: LoggerService,

    @Inject(forwardRef(() => MaterialsService))
    private readonly materialService: MaterialsService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepo.create(createOrderDto);
    return await this.orderRepo.save(newOrder);
  }

  // Method to create and save a new order detail
  async createOrderDetail(data: CreateOrderDetailDto): Promise<any> {
    const newOrderDetail = this.orderDetailRepo.create(data);
    return await this.orderDetailRepo.save(newOrderDetail);
  }

  async deleteOrder(order_id: string): Promise<string> {
    try {
      // get order detail
      const orderDetail = await this.orderDetailRepo.find({
        where: {
          order_id,
        },
      });
      // delete order detail
      for (let i = 0; i < orderDetail.length; i++) {
        await this.orderDetailRepo.delete(orderDetail[i].order_detail_id);
      }
      // delete order
      await this.orderRepo.delete(order_id);
      return 'Order is deleted';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async cancelOrder(order_id: string): Promise<string> {
    try {
      // get order
      const order = await this.orderRepo.findOne({
        where: {
          order_id,
        },
      });
      if (!order) {
        throw new BadRequestException('Order not found');
      }
      // get list order detail
      const orderDetail = await this.orderDetailRepo.find({
        where: {
          order_id,
        },
      });
      // check
      if (orderDetail.length === 0) {
        throw new BadRequestException('Order detail not found');
      }
      // Loop for each order detail
      for (let i = 0; i < orderDetail.length; i++) {
        // Update quantity material
        await this.materialService.handleCancelOrder(
          orderDetail[i].material_id,
          orderDetail[i].quantity,
        );
        // delete order detail
        await this.orderDetailRepo.delete(orderDetail[i].order_detail_id);
      }
      // delete order
      await this.orderRepo.delete(order_id);
      return 'Order is canceled';
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOrdersByUser(user: IUser, pagination: PaginationParams): Promise<Order[]> {
    const filter_condition: any = {};

    if (user.role === UserRole.land_renter) {
      filter_condition.landrenter_id = user.user_id;
    }

    return await this.orderRepo.find({
      where: filter_condition,
      take: pagination.page_size,
      skip: (pagination.page_index - 1) * pagination.page_size,
      order: {
        updated_at: 'DESC',
      },
      relations: {
        orders_detail: {
          material: true,
        },
        transaction: true,
      },
    });
  }

  async getOrderForDashboard(): Promise<any> {
    try {
      // get all order detail
      const orders_detail = await this.orderDetailRepo.find({
        relations: {
          material: true,
        },
      });
      // reduce code to material
      const materials = orders_detail.reduce((acc, order_detail): any => {
        if (!acc[order_detail.material.name]) {
          acc[order_detail.material.name] = {
            total_buy: 0,
          };
        }
        acc[order_detail.material.name].total_buy += order_detail.quantity;
        return acc;
      }, {});
      return materials;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
