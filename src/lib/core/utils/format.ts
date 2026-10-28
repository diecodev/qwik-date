import type { Locale } from '../types';
import { parseLocalDate } from './local-date';

/** Upper-cases the first letter: many languages write month and weekday names in lower case ("agosto"). */
export const capitalize = (text: string, locale: Locale) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

/** A day as the DatePicker trigger shows it: "Aug 01, 2024", "01 Ago 2024" (two-digit day, capitalized month). */
export const formatDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' })
    .formatToParts(parseLocalDate(value))
    .map((part) => (part.type === 'month' ? capitalize(part.value, locale) : part.value))
    .join('');
