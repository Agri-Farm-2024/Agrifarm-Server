export interface ITransactionService {
  createTransaction(data: any, user: any): Promise<any>;
}
