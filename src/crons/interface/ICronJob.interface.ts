export interface ICronJob {
  checkEverydayIsExpired(): Promise<void>;

  checkTransactionIsExpired(): Promise<void>;

  checkTaskProcessContentForExpert(): Promise<void>;
}
