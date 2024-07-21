type DayFormats = 'dd' | 'd';
type MonthFormats = 'mm' | 'm' | 'MMM' | 'MMMM';
type YearFormats = 'yyyy' | 'yy';
export type Separator = '/' | '-' | '.';
export type DateFormat =
  | `${DayFormats}${Separator}${MonthFormats}${Separator}${YearFormats}`
  | `${YearFormats}${Separator}${MonthFormats}${Separator}${DayFormats}`
  | `${MonthFormats}${Separator}${DayFormats}${Separator}${YearFormats}`;

export type Locale = 'en' | 'es';
export type Month = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';
