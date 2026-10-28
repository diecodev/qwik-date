import type { DateRange, Labels, LocalDate, Locale, Month, WeekDay } from '../types';
import { type Availability, isUnavailable } from './availability';
import { daysArrGenerator } from './date-generator';
import { formatMonth } from './format';
import { getRowWeekNumber } from './get-week-number';
import { isValidLocalDate, parseLocalDate } from './local-date';
import { isInsideRange, isValidRange, nextRange } from './range';

/** `single` selects a day, `range` a start and an end. */
export type Mode = 'single' | 'range';

/** The value of any mode: a day, a range, or `null` for none. */
export type CalendarValue = LocalDate | DateRange | null;

/** A day of a month grid, with what it shows. */
export interface CalendarDay {
  date: LocalDate;
  /** its accessible name: "Thursday, August 15, 2024" */
  label: string;
  /** a day of an adjacent month (`fullWeeks`): disabled, and never selected nor today */
  outside: boolean;
  /** ruled out by `min`, `max`, `disabledDates` or `disabledWeekdays` */
  unavailable: boolean;
  /** `outside` or `unavailable`: it can't be chosen */
  disabled: boolean;
  today: boolean;
  /** the selected day, or an end of the selected range */
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  /** strictly between the ends of the range: selected too, but not highlighted */
  inRange: boolean;
  /** where Tab enters the grid */
  tabbable: boolean;
}

export interface CalendarWeek {
  /** the ISO week number */
  number: number;
  /** `null` for the cells before the 1st and after the last day, without `fullWeeks` */
  days: (CalendarDay | null)[];
}

/** A month as a grid shows it. */
export interface CalendarGrid {
  year: number;
  month: Month;
  /** "August 2024", "Agosto 2024" */
  title: string;
  weeks: CalendarWeek[];
}

const dayFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

/** The day the calendar opens on for a value: the selected day, or the start of the range. */
export const openingDay = (value: CalendarValue) => (value === null || typeof value === 'string' ? value : value.start);

/** The value after choosing `day`: that day, or the range it starts or ends. */
export const nextValue = (mode: Mode, value: CalendarValue, day: LocalDate, availability: Availability = {}) =>
  mode === 'range' ? nextRange(value as DateRange | null, day, availability) : day;

/** Existing days in `YYYY-MM-DD`, and a range that ends after it starts. */
export const isValidValue = (value: LocalDate | DateRange) =>
  typeof value === 'string' ? isValidLocalDate(value) : isValidRange(value);

/** Where Tab enters a month: `focusDay` if it's in it and can be chosen, or else its first day that can be. */
export const tabDayOf = (year: number, month: Month, focusDay: LocalDate, availability: Availability = {}) => {
  const shown = `${year}-${month}`;
  if (focusDay.startsWith(shown) && !isUnavailable(focusDay, availability)) return focusDay;

  const length = new Date(year, +month, 0).getDate();
  for (let date = 1; date <= length; date++) {
    const day = `${shown}-${String(date).padStart(2, '0')}` as LocalDate;
    if (!isUnavailable(day, availability)) return day;
  }
  return null;
};

/** The end of the calendar's accessible name: "selected date: Thursday, August 15, 2024", or `null` without a value. */
export const selectionLabel = (value: CalendarValue, locale: Locale, labels: Labels) => {
  if (!value) return null;

  const long = (day: LocalDate) => dayFormatter(locale).format(parseLocalDate(day));
  if (typeof value === 'string') return `${labels.selectedDate} ${long(value)}`;
  return `${labels.selectedRange} ${long(value.start)} – ${value.end ? long(value.end) : '…'}`;
};

/** A month and the state of each of its days, as a grid shows them. */
export const calendarGrid = ({
  year,
  month,
  value,
  today,
  tabDay,
  locale,
  weekStartsOn = 0,
  fullWeeks = false,
  availability = {},
}: {
  year: number;
  month: Month;
  value: CalendarValue;
  today: LocalDate;
  tabDay: LocalDate | null;
  locale: Locale;
  weekStartsOn?: WeekDay;
  fullWeeks?: boolean;
  availability?: Availability;
}): CalendarGrid => {
  const format = dayFormatter(locale);
  const range = value !== null && typeof value !== 'string' ? value : null;

  const describe = (date: LocalDate): CalendarDay => {
    const outside = date.slice(5, 7) !== month;
    const unavailable = !outside && isUnavailable(date, availability);
    const rangeStart = !outside && date === range?.start;
    const rangeEnd = !outside && date === range?.end;
    return {
      date,
      label: format.format(parseLocalDate(date)),
      outside,
      unavailable,
      disabled: outside || unavailable,
      today: !outside && date === today,
      selected: !outside && (range ? rangeStart || rangeEnd : date === value),
      rangeStart,
      rangeEnd,
      inRange: !outside && !!range && isInsideRange(date, range),
      tabbable: date === tabDay,
    };
  };

  const weeks = daysArrGenerator({ month, year: String(year), fullWeeks, weekStartsOn }).map((week) => ({
    number: getRowWeekNumber(week, weekStartsOn),
    days: week.map((day) => (day ? describe(day as LocalDate) : null)),
  }));
  return { year, month, title: formatMonth(year, +month, locale), weeks };
};
