import type { WeekDay } from '../types';
import { parseLocalDate, toLocalDateString } from './local-date';

export const getWeekNumber = (dateString: string) => {
  const date = parseLocalDate(dateString);
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7; // Make Monday=0, Tuesday=1, ..., Sunday=6
  target.setDate(target.getDate() - dayNumber + 3); // Set to nearest Thursday
  const firstThursday = new Date(target.getFullYear(), 0, 4); // The first Thursday of the year
  const weekNumber =
    1 +
    Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return weekNumber;
};

// ISO weeks start on Monday, calendar rows on `weekStartsOn`: number a row after its Monday, which
// shares the ISO week of most of the row (all of it with Monday-first rows, six days with Sunday-first
// ones). Rows keep their nulls, so the index of a cell gives its weekday.
export const getRowWeekNumber = (week: (string | null)[], weekStartsOn: WeekDay = 0) => {
  const index = week.findIndex((day) => day !== null);
  const mondayIndex = (1 - weekStartsOn + 7) % 7;
  const monday = parseLocalDate(week[index] as string);
  monday.setDate(monday.getDate() + mondayIndex - index);
  return getWeekNumber(toLocalDateString(monday));
};
