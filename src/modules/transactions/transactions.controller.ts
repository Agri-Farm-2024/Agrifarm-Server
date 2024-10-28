import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
}
