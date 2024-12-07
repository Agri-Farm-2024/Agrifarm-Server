import { Transform } from 'class-transformer';

export function ResetToStartOfDay() {
  return Transform(({ value }) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      value.setHours(0, 0, 0, 0);
      return value;
    }
    return value; // Return unmodified value if not a valid Date
  });
}
