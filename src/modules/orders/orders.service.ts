import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IOrdersService } from './interfaces/IOrderService.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { OrderDetail } from './entities/orderDetail.entity';
import { Material } from '../materials/entities/material.entity';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,

    private readonly loggerService: LoggerService,

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
  
  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
