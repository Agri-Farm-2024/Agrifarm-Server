import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { CreateOrderDetailDto } from '../dto/create-order-detail.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { IUser } from 'src/modules/auths/interfaces/IUser.interface';

export interface IOrdersService {
  createOrder(createOrderDto: CreateOrderDto): Promise<Order>;

  createOrderDetail(data: CreateOrderDetailDto): Promise<any>;

  deleteOrder(order_id: string): Promise<string>;

  cancelOrder(order_id: string): Promise<string>;

  getOrdersByUser(user: IUser, pagination: PaginationParams): Promise<Order[]>;

  getOrderForDashboard(): Promise<any>;
}
