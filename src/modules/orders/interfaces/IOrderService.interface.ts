import { CreateOrderDetailDto } from "../dto/create-order-detail.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { Order } from "../entities/order.entity";

export interface IOrdersService {
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;

    createOrderDetail(data: CreateOrderDetailDto): Promise<any>;

    deleteOrder(order_id: string);

    cancelOrder(order_id: string);

    
}