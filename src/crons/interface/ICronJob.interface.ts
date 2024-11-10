export interface ICronJob {
  checkBookingIsExpired(): Promise<void>;

  checkTransactionIsExpired(): Promise<void>;
}
