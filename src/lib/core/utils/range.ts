import type { DateRange, LocalDate } from '../types';
import { type Availability, isUnavailable } from './availability';
import { isValidLocalDate } from './local-date';
import { addDays } from './navigation';

/**
 * The range after choosing `day`: the first day starts it, the second ends it (they swap if it's earlier),
 * and a day chosen after a complete range starts a new one. A range can't cross a day that can't be chosen:
 * it stops right before the first one.
 */
export const nextRange = (range: DateRange | null, day: LocalDate, availability: Availability = {}): DateRange => {
  if (!range || range.end) return { start: day, end: null };

  const step = day < range.start ? -1 : 1;
  let reached = range.start;
  while (reached !== day) {
    const next = addDays(reached, step);
    if (isUnavailable(next, availability)) break;
    reached = next;
  }
  return step > 0 ? { start: range.start, end: reached } : { start: reached, end: range.start };
};

/** Strictly between the start and the end (`YYYY-MM-DD` strings sort like the days they stand for). */
export const isInsideRange = (day: string, range: DateRange) =>
  range.end !== null && day > range.start && day < range.end;

export const isValidRange = (range: DateRange) =>
  isValidLocalDate(range.start) && (range.end === null || (isValidLocalDate(range.end) && range.start <= range.end));
