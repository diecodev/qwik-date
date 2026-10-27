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

// Calendar rows start on Sunday but ISO weeks start on Monday: number a row after its Monday,
// which shares the week of six of its seven days (rows keep their nulls, so index = weekday)
export const getRowWeekNumber = (week: (string | null)[]) => {
  const index = week.findIndex((day) => day !== null);
  const monday = parseLocalDate(week[index] as string);
  monday.setDate(monday.getDate() + 1 - index);
  return getWeekNumber(toLocalDateString(monday));
};
