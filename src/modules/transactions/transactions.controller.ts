import {
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Payload } from '../auths/types/payload.type';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';

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

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager)
  @ApplyPaginationMetadata
  @Get('/getAllTransaction')
  getAllTransaction(@Pagination() pagination: PaginationParams) {
    return this.transactionsService.getAllTransaction(pagination);
  }

  @Get('/:transaction_id')
  getDetailTransaction(@Param('transaction_id') transaction_id: string) {
    return this.transactionsService.getDetailTransaction(transaction_id);
  }

  @Delete('/:transaction_id')
  cancelTransaction(@Param('transaction_id') transaction_id: string) {
    return this.transactionsService.cancelTransaction(transaction_id);
  }
}
