import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApplyPaginationMetadata, Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @ApplyPaginationMetadata
  @Get()
  async getOrdersByUser(@Request() req: any, @Pagination() pagination: PaginationParams) {
    const user = req['user'];
    return await this.ordersService.getOrdersByUser(user, pagination);
  }
}
