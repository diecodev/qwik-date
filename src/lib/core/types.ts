type DayFormats = 'dd' | 'd';
type MonthFormats = 'mm' | 'm' | 'MMM' | 'MMMM';
type YearFormats = 'yyyy' | 'yy';
export type Separator = '/' | '-' | '.';
export type DateFormat =
  | `${DayFormats}${Separator}${MonthFormats}${Separator}${YearFormats}`
  | `${YearFormats}${Separator}${MonthFormats}${Separator}${DayFormats}`
  | `${MonthFormats}${Separator}${DayFormats}${Separator}${YearFormats}`;

/** A day as `YYYY-MM-DD`, without time or timezone. */
export type LocalDate = `${number}-${number}-${number}`;
/** The languages with built-in texts. */
export type BuiltInLocale = 'en' | 'es';
/** A BCP 47 language tag, as `Intl` takes it ("fr", "de-AT"). */
export type Locale = BuiltInLocale | (string & {});
/** 0 is Sunday, as in `Date#getDay()`. */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** The texts `Intl` can't give: built in for `en` and `es`, required for any other locale. */
export interface Labels {
  /** the calendar's accessible name */
  calendar: string;
  previousMonth: string;
  nextMonth: string;
  /** goes between the calendar's name and the selected date, in its accessible name */
  selectedDate: string;
  /** what the DatePicker trigger shows without a value */
  placeholder: string;
}
/** `auto` follows the operating system's color scheme (`prefers-color-scheme`). */
export type Theme = 'light' | 'dark' | 'auto';
export type Month = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';
