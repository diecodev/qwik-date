import type { LocalDate, WeekDay } from '../types';
import { addMonths, parseLocalDate, toLocalDateString } from './local-date';

export type GridKey = 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright' | 'home' | 'end' | 'pageup' | 'pagedown';

export const addDays = (day: string, days: number) => {
  const date = parseLocalDate(day);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date) as LocalDate;
};

/**
 * The day a grid key moves the focus to (left and right as they read in left-to-right layouts): a day or a
 * week away, the same day of the adjacent month, or the start or the end of the row. Without `fullWeeks` a
 * row only shows the days of its month, so Home and End stop at its first and last day.
 */
export const keyTarget = (
  day: LocalDate,
  key: GridKey,
  { weekStartsOn = 0, fullWeeks = false }: { weekStartsOn?: WeekDay; fullWeeks?: boolean } = {},
): LocalDate => {
  const column = (parseLocalDate(day).getDay() - weekStartsOn + 7) % 7;
  const month = day.slice(0, 7);
  switch (key) {
    case 'arrowleft':
      return addDays(day, -1);
    case 'arrowright':
      return addDays(day, 1);
    case 'arrowup':
      return addDays(day, -7);
    case 'arrowdown':
      return addDays(day, 7);
    case 'pageup':
      return toLocalDateString(addMonths(parseLocalDate(day), -1)) as LocalDate;
    case 'pagedown':
      return toLocalDateString(addMonths(parseLocalDate(day), 1)) as LocalDate;
    case 'home': {
      const start = addDays(day, -column);
      return fullWeeks || start.startsWith(month) ? start : (`${month}-01` as LocalDate);
    }
    case 'end': {
      const end = addDays(day, 6 - column);
      if (fullWeeks || end.startsWith(month)) return end;
      const date = parseLocalDate(day);
      return toLocalDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0)) as LocalDate;
    }
  }
};
