export const getTimeByPlusDays = (time: Date, days: number): Date => {
  const result = new Date(time);
  result.setDate(result.getDate() + days);
  return result;
};
