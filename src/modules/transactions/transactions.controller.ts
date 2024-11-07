import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Payload } from '../auths/types/payload.type';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard)
  @ApplyPaginationMetadata
  @Get('/getListTransactionByUser')
  getListTransactionByLandrenter(
    @Request() req: any,
    @Pagination() pagination: PaginationParams,
  ) {
    const user: Payload = req['user'];
    return this.transactionsService.getListTransactionByUser(user, pagination);
  }
}
