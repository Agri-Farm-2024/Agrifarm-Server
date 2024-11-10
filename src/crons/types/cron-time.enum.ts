export enum CronTime {
  // every new day at 00:00:00
  check_booking_is_expired = '0 0 0 * * *',

  // every 10 minutes
  check_transaction_is_expired = '0 */10 * * * *',
}
