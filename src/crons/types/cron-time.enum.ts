export enum CronTime {
  // every new day at 00:00:00
  every_new_day = '0 0 0 * * *',

  // every 10 minutes
  every_ten_minutes = '0 */10 * * * *',

  // every 5 pm a day
  every_five_pm_hours_a_day = '0 0 17 * * *',

  // every 1 hour a day
  every_one_hour_a_day = '0 0 */1 * * *',

  // every 8 am a day
  every_eight_am_hours_a_day = '0 0 8 * * *',

  // test func when start server,
  test = '0 */1 * * * *',
}
