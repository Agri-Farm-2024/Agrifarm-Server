import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Payload } from '../auths/types/payload.type';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { TransactionStatus } from './types/transaction-status.enum';
import { TransactionPurpose } from './types/transaction-purpose.enum';
import { TransactionType } from './types/transaction-type.enum';

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
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'purpose', required: false, enum: TransactionPurpose })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @Get('/getAllTransaction')
  getAllTransaction(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: TransactionStatus,
    @Query('purpose') purpose: TransactionPurpose,
    @Query('type') type: TransactionType,
  ) {
    return this.transactionsService.getAllTransaction(
      pagination,
      status,
      purpose,
      type,
    );
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
