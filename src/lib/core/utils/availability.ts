import type { LocalDate, WeekDay } from '../types';
import { parseLocalDate } from './local-date';
import { addDays } from './navigation';

/** The days that can be chosen. Strings, not a function: props have to serialize (a function would be a QRL). */
export interface Availability {
  /** the first day that can be chosen */
  min?: LocalDate;
  /** the last day that can be chosen */
  max?: LocalDate;
  disabledDates?: readonly LocalDate[];
  /** 0 for Sunday: `[0, 6]` disables the weekends */
  disabledWeekdays?: readonly WeekDay[];
}

export const isUnavailable = (day: string, { min, max, disabledDates, disabledWeekdays }: Availability) =>
  (min !== undefined && day < min) ||
  (max !== undefined && day > max) ||
  !!disabledDates?.includes(day as LocalDate) ||
  !!disabledWeekdays?.includes(parseLocalDate(day).getDay() as WeekDay);

/**
 * The first day that can be chosen from `day` on, `step` by `step` (`day` included). A day past `min` or `max`
 * goes back to it first. `null` when there's none before the other limit, or within a year.
 */
export const nearestAvailable = (day: LocalDate, step: 1 | -1, availability: Availability): LocalDate | null => {
  const { min, max } = availability;
  let current = day;
  let direction = step;
  if (max !== undefined && current > max) [current, direction] = [max, -1];
  if (min !== undefined && current < min) [current, direction] = [min, 1];
  for (let i = 0; i <= 366; i++) {
    if ((min !== undefined && current < min) || (max !== undefined && current > max)) return null;
    if (!isUnavailable(current, availability)) return current;
    current = addDays(current, direction);
  }
  return null;
};

/** Whether a month has days the limits allow (`min`/`max` only: the other rules leave most days of a month). */
export const isMonthInLimits = (year: number, month: string, { min, max }: Availability) => {
  const shown = `${year}-${month}`;
  return (min === undefined || min.slice(0, 7) <= shown) && (max === undefined || max.slice(0, 7) >= shown);
};

/** `day`, or the limit it's past: the month a calendar without a value opens on. */
export const clampDay = (day: LocalDate, { min, max }: Availability) =>
  min !== undefined && day < min ? min : max !== undefined && day > max ? max : day;

/** The year and month `delta` months away. */
export const shiftMonth = (year: number, month: string, delta: number) => {
  const date = new Date(year, +month - 1 + delta, 1);
  return { year: date.getFullYear(), month: String(date.getMonth() + 1).padStart(2, '0') };
};
