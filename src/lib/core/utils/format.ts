import { LABELS, MONTHS_LG, WEEKDAYS } from '../constants';
import type { BuiltInLocale, DateRange, Labels, Locale, WeekDay } from '../types';
import { parseLocalDate } from './local-date';

export const isBuiltInLocale = (locale: Locale): locale is BuiltInLocale => locale === 'en' || locale === 'es';

/** The built-in texts of `en` and `es` with the given overrides, or the given ones for any other locale. */
export const resolveLabels = (locale: Locale, labels?: Partial<Labels>): Labels =>
  isBuiltInLocale(locale) ? { ...LABELS[locale], ...labels } : (labels as Labels);

/** Upper-cases the first letter: many languages write month and weekday names in lower case ("agosto"). */
export const capitalize = (text: string, locale: Locale) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

/** A day as the DatePicker trigger shows it: "Aug 01, 2024", "01 Ago 2024" (two-digit day, capitalized month). */
export const formatDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' })
    .formatToParts(parseLocalDate(value))
    .map((part) => (part.type === 'month' ? capitalize(part.value, locale) : part.value))
    .join('');

/**
 * A range as the DatePicker trigger shows it: "Aug 05, 2024 – Aug 12, 2024", or "Aug 05, 2024 – …" until it
 * has an end. Two full dates, not `Intl#formatRange`: it drops the two-digit day and its separators change
 * between engines.
 */
export const formatDateRange = (range: DateRange, locale: Locale) =>
  `${formatDate(range.start, locale)} – ${range.end ? formatDate(range.end, locale) : '…'}`;

/** The title of a month: "August 2024", "Agosto 2024", "Août 2024", "2024年8月". */
export const formatMonth = (year: number, month: number, locale: Locale) => {
  if (isBuiltInLocale(locale)) return `${MONTHS_LG[locale][month - 1]} ${year}`;
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .formatToParts(new Date(year, month - 1, 1))
    .map((part) => (part.type === 'month' ? capitalize(part.value, locale) : part.value))
    .join('');
};

/**
 * The weekday names in column order, starting on `weekStartsOn`: `short` for the header ("Su", "Lu", "Lun."),
 * `long` for its accessible name.
 */
export const weekdayNames = (locale: Locale, weekStartsOn: WeekDay = 0) =>
  Array.from({ length: 7 }, (_, column) => {
    const weekday = (weekStartsOn + column) % 7;
    if (isBuiltInLocale(locale)) {
      const long = WEEKDAYS[locale][weekday];
      // two letters, without accents ("Mi" for Miércoles)
      return { long, short: long.slice(0, 2).normalize('NFD').replace(/\p{M}/gu, '') };
    }
    const date = new Date(2024, 0, 7 + weekday); // January 7, 2024 is a Sunday
    const name = (weekday: 'long' | 'short') =>
      capitalize(new Intl.DateTimeFormat(locale, { weekday }).format(date), locale);
    return { long: name('long'), short: name('short') };
  });
