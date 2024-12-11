import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../types/transaction-status.enum';
import { TransactionPurpose } from '../types/transaction-purpose.enum';
import { TransactionType } from '../types/transaction-type.enum';

export interface ITransactionService {
  createTransaction(data: any, user: any): Promise<any>;

  createTransactionPaymentBookingLand(booking_id: string): Promise<any>;

  handleTransactionPayment(transaction_code: string, total_price: number): Promise<any>;

  handlePaymentBookingLand(transaction: Transaction): Promise<any>;

  getListTransactionByUser(params: any, user: any): Promise<any>;

  getAllTransaction(
    pagination: PaginationParams,
    status: TransactionStatus,
    purpose: TransactionPurpose,
    type: TransactionType,
  ): Promise<any>;

  getDetailTransaction(transaction_id: string): Promise<any>;

  cancelTransaction(transaction_id: string): Promise<any>;

  checkTransactionIsExpired(): Promise<void>;

  getRevenueForDashboard(): Promise<any>;
}
