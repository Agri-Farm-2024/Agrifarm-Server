export const getTimeByPlusDays = (time: Date, days: number): Date => {
  const result = new Date(time);
  result.setDate(result.getDate() + days);
  return result;
};

export const getTimeByPlusMonths = (time: Date, months: number): Date => {
  const result = new Date(time);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const setTimeExpireSchedule = (): Date => {
  const result = new Date();
  // check next day is weekend
  if (result.getDay() === 5) {
    result.setDate(result.getDate() + 3);
  } else if (result.getDay() === 6) {
    result.setDate(result.getDate() + 4);
  } else {
    result.setDate(result.getDate() + 2);
  }
  return result;
};

export const getDateWithoutTime = (time: Date): Date => {
  return new Date(time.setUTCHours(0, 0, 0, 0));
};
