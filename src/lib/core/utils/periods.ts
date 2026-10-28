import type { LocalDate, Locale, Month } from '../types';
import { type Availability, isMonthInLimits, shiftMonth } from './availability';
import { type CalendarValue, selectedDays } from './calendar';
import { formatMonth, formatYear, monthName } from './format';

/** What the calendar shows: the days of a month, the months of a year (a click on the title), or twelve years. */
export type CalendarView = 'days' | 'months' | 'years';

/** A month and its year: the focused cell of the months and years grids. */
export interface YearMonth {
  year: number;
  month: Month;
}

/** A month of the months grid, or a year of the years grid. */
export interface CalendarPeriod {
  year: number;
  /** `null` for a year */
  month: Month | null;
  /** what the cell shows: "Aug", "2024" */
  text: string;
  /** its accessible name: "August 2024", "2024" */
  label: string;
  /** past `min` or `max`: none of its days can be chosen */
  disabled: boolean;
  /** it has the selected day, an end of the selected range, or one of the selected days */
  selected: boolean;
  /** it has today */
  today: boolean;
  /** where Tab enters the grid */
  tabbable: boolean;
}

/** The years grid shows twelve years, from a multiple of twelve: 2016–2027. */
export const YEARS_PER_PAGE = 12;

/** The first year of the years grid that shows `year`. */
export const yearPageStart = (year: number) => year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);

/** Whether a year has days `min` and `max` allow. */
export const isYearInLimits = (year: number, { min, max }: Availability) =>
  (min === undefined || +min.slice(0, 4) <= year) && (max === undefined || +max.slice(0, 4) >= year);

/** Whether the years grid that starts on `start` has a year `min` and `max` allow. */
export const isPageInLimits = (start: number, { min, max }: Availability) =>
  (min === undefined || +min.slice(0, 4) <= start + YEARS_PER_PAGE - 1) &&
  (max === undefined || +max.slice(0, 4) >= start);

/** `year`, or the year of the limit it's past. */
export const clampYear = (year: number, { min, max }: Availability) =>
  Math.min(Math.max(year, min === undefined ? year : +min.slice(0, 4)), max === undefined ? year : +max.slice(0, 4));

/** Whether the previous (`-1`) or next (`1`) button can move: a month, a year or twelve years, as the view shows. */
export const canStep = (
  delta: 1 | -1,
  view: CalendarView,
  shown: YearMonth,
  focus: YearMonth,
  limits: Availability,
  count = 1,
) => {
  if (view === 'days') {
    // forward, the month after the last one on show
    const target = shiftMonth(shown.year, shown.month, delta < 0 ? -1 : count);
    return isMonthInLimits(target.year, target.month, limits);
  }
  if (view === 'months') return isYearInLimits(focus.year + delta, limits);
  return isPageInLimits(yearPageStart(focus.year) + delta * YEARS_PER_PAGE, limits);
};

/** `month` of `year`, or the month of the limit it's past: where choosing a year shows its days. */
export const clampMonth = (year: number, month: Month, { min, max }: Availability): YearMonth => {
  const shown = `${year}-${month}`;
  const limit =
    min !== undefined && shown < min.slice(0, 7) ? min : max !== undefined && shown > max.slice(0, 7) ? max : null;
  return limit ? { year: +limit.slice(0, 4), month: limit.slice(5, 7) as Month } : { year, month };
};

/** The same day of another month, or its last day when the month is shorter (the 31st of August is the 30th of September). */
export const sameDayIn = (day: LocalDate, { year, month }: YearMonth) => {
  const length = new Date(year, +month, 0).getDate();
  return `${year}-${month}-${String(Math.min(+day.slice(8), length)).padStart(2, '0')}` as LocalDate;
};

interface PeriodOptions {
  /** the focused cell */
  focus: YearMonth;
  value: CalendarValue;
  today: LocalDate;
  locale: Locale;
  availability?: Availability;
}

/** The twelve months of the focused year, as the months grid shows them. */
export const monthCells = ({ focus, value, today, locale, availability = {} }: PeriodOptions): CalendarPeriod[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, '0') as Month;
    const shown = `${focus.year}-${month}`;
    return {
      year: focus.year,
      month,
      text: monthName(index + 1, locale, 'short'),
      label: formatMonth(focus.year, index + 1, locale),
      disabled: !isMonthInLimits(focus.year, month, availability),
      selected: selectedDays(value).some((day) => day.startsWith(shown)),
      today: today.startsWith(shown),
      tabbable: month === focus.month,
    };
  });

/** The twelve years around the focused one, as the years grid shows them. */
export const yearCells = ({ focus, value, today, locale, availability = {} }: PeriodOptions): CalendarPeriod[] => {
  const start = yearPageStart(focus.year);
  return Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
    const year = start + index;
    const text = formatYear(year, locale);
    return {
      year,
      month: null,
      text,
      label: text,
      disabled: !isYearInLimits(year, availability),
      selected: selectedDays(value).some((day) => +day.slice(0, 4) === year),
      today: +today.slice(0, 4) === year,
      tabbable: year === focus.year,
    };
  });
};

/** The title of a view: "August 2024", "2024", "2016 – 2027". */
export const viewTitle = (view: CalendarView, shown: YearMonth, focus: YearMonth, locale: Locale) => {
  if (view === 'days') return formatMonth(shown.year, +shown.month, locale);
  if (view === 'months') return formatYear(focus.year, locale);
  const start = yearPageStart(focus.year);
  return `${formatYear(start, locale)} – ${formatYear(start + YEARS_PER_PAGE - 1, locale)}`;
};

export type PeriodKey = 'arrowleft' | 'arrowright' | 'arrowup' | 'arrowdown';

/** The months and years grids have three columns. */
const PERIOD_STEPS: Record<PeriodKey, number> = { arrowleft: -1, arrowright: 1, arrowup: -3, arrowdown: 3 };

/**
 * The cell an arrow moves the focus to in the months or years grid (left and right as they read in left-to-right
 * layouts), across years and pages; `null` past `min` or `max`, where it stays put.
 */
export const periodKeyTarget = (
  view: 'months' | 'years',
  focus: YearMonth,
  key: PeriodKey,
  availability: Availability = {},
): YearMonth | null => {
  const step = PERIOD_STEPS[key];
  if (view === 'years') {
    const year = focus.year + step;
    return isYearInLimits(year, availability) ? { year, month: focus.month } : null;
  }
  const index = focus.year * 12 + +focus.month - 1 + step;
  const target = { year: Math.floor(index / 12), month: String((index % 12) + 1).padStart(2, '0') as Month };
  return isMonthInLimits(target.year, target.month, availability) ? target : null;
};

/** The months a calendar shows side by side, from the first one. */
export const shownMonths = (first: YearMonth, count: number): YearMonth[] =>
  Array.from({ length: count }, (_, index) => {
    const { year, month } = shiftMonth(first.year, first.month, index);
    return { year, month: month as Month };
  });

const monthIndex = ({ year, month }: YearMonth) => year * 12 + +month - 1;

/** Whether `day` is in one of the months on show (not as a day of an adjacent month). */
export const isShown = (day: string, first: YearMonth, count: number) => {
  const index = +day.slice(0, 4) * 12 + +day.slice(5, 7) - 1;
  return index >= monthIndex(first) && index < monthIndex(first) + count;
};

/**
 * The first month to show for the focus to reach `day`: the same when it's on show, or as few months away as it
 * takes, so the keyboard goes from one grid to the next without jumps.
 */
export const firstShownFor = (day: LocalDate, first: YearMonth, count: number): YearMonth => {
  const target = { year: +day.slice(0, 4), month: day.slice(5, 7) as Month };
  if (monthIndex(target) < monthIndex(first)) return target;
  const last = monthIndex(first) + count - 1;
  if (monthIndex(target) <= last) return first;
  const { year, month } = shiftMonth(target.year, target.month, 1 - count);
  return { year, month: month as Month };
};

/** Where the calendar moved: to a later (`next`) or an earlier (`prev`) month, year or page; `null` for nowhere. */
export type Direction = 'next' | 'prev';

/** The direction from one position to another (months or years as numbers), `null` without a move or a start. */
export const stepDirection = (from: number | null, to: number): Direction | null =>
  from === null || from === to ? null : to > from ? 'next' : 'prev';
