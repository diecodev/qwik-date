import type { DateRange, LocalDate } from '../types';
import { isValidLocalDate } from './local-date';

/**
 * The range after choosing `day`: the first day starts it, the second ends it (they swap if it's earlier),
 * and a day chosen after a complete range starts a new one.
 */
export const nextRange = (range: DateRange | null, day: LocalDate): DateRange => {
  if (!range || range.end) return { start: day, end: null };
  return day < range.start ? { start: day, end: range.start } : { start: range.start, end: day };
};

/** Strictly between the start and the end (`YYYY-MM-DD` strings sort like the days they stand for). */
export const isInsideRange = (day: string, range: DateRange) =>
  range.end !== null && day > range.start && day < range.end;

export const isValidRange = (range: DateRange) =>
  isValidLocalDate(range.start) && (range.end === null || (isValidLocalDate(range.end) && range.start <= range.end));
