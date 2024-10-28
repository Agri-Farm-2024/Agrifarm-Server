import { Injectable } from '@nestjs/common';
import { ITransactionService } from './interfaces/transaction.interface';

@Injectable()
export class TransactionsService implements ITransactionService {
  /**
   * @function createTransaction
   * @param data
   * @param user
   */

  async createTransaction(data: any, user: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
