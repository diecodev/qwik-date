import type { Locale, Month } from '../../core';

type LocalDate = `${number}-${number}-${number}`;
type DateParts = { year: number; month: Month; day: string };

export const formatDate = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const parseLocalDate = (dateStr: LocalDate): DateParts => {
  const [year, month, day] = dateStr.split('-');
  return {
    year: Number.parseInt(year, 10),
    month: month as Month,
    day,
  };
};

export const isMonth = (value: string): value is Month => {
  return /^(0[1-9]|1[0-2])$/.test(value);
};
