import {
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

  async deleteOrder(order_id: string) {
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

  async cancelOrder(order_id: string) {
    try {
      // get list order detail
      const orderDetail = await this.orderDetailRepo.find({
        where: {
          order_id,
        },
      });
      // update quantity material
      for (let i = 0; i < orderDetail.length; i++) {
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
      throw new InternalServerErrorException(error.message);
    }
  }
}
