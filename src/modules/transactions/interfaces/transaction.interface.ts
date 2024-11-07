export interface ITransactionService {
  createTransaction(data: any, user: any): Promise<any>;

  getListTransactionByUser(params: any, user: any): Promise<any>;

  // getAllTransaction(params: any, user: any): Promise<any>;

  // getDetailTransaction(transaction_id: string, user: any): Promise<any>;
}
