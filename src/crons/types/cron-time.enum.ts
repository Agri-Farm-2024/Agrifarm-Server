export enum CronTime {
  // every new day at 00:00:00
  every_new_day = '0 0 0 * * *',

  // every 10 minutes
  every_ten_minutes = '0 */10 * * * *',

  // every 12 hours a day
  every_five_pm_hours_a_day = '0 17 * * *',

  // test func when start server,
  test = '0 */1 * * * *',
}
