import { describe, expect, it } from 'vitest';
import {
  type CalendarDay,
  type CalendarGrid,
  type LocalDate,
  calendarGrid,
  isValidValue,
  nextValue,
  openingDay,
  resolveLabels,
  selectionLabel,
  tabDayOf,
} from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

const days = (grid: CalendarGrid) => grid.weeks.flatMap((week) => week.days).filter((day) => day !== null);
const dayOf = (grid: CalendarGrid, date: string) => days(grid).find((day) => day.date === date) as CalendarDay;
const dates = (grid: CalendarGrid, flag: keyof CalendarDay) =>
  days(grid)
    .filter((day) => day[flag] === true)
    .map((day) => day.date);

const august = {
  year: 2024,
  month: '08',
  value: null,
  today: '2024-08-20',
  tabDay: '2024-08-01',
  locale: 'en',
} as const;

describe.each(TIMEZONES)('the grid of a month in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('has the weeks of the month, with empty cells around it and ISO week numbers', () => {
    const grid = calendarGrid(august);
    expect(grid.title).toBe('August 2024');
    expect(grid.weeks.map((week) => week.number)).toEqual([31, 32, 33, 34, 35]);
    // August 1, 2024 is a Thursday: four empty cells before it in a Sunday-first row
    expect(grid.weeks[0].days.map((day) => day?.date ?? null)).toEqual([
      null,
      null,
      null,
      null,
      '2024-08-01',
      '2024-08-02',
      '2024-08-03',
    ]);
    expect(days(grid)).toHaveLength(31);
  });

  it('names each day in the locale', () => {
    expect(dayOf(calendarGrid(august), '2024-08-15').label).toBe('Thursday, August 15, 2024');
    expect(dayOf(calendarGrid({ ...august, locale: 'es' }), '2024-08-15').label).toBe('jueves, 15 de agosto de 2024');
    // the day daylight saving starts in Europe and in the US
    expect(dayOf(calendarGrid({ ...august, month: '03' }), '2024-03-31').label).toBe('Sunday, March 31, 2024');
    expect(dayOf(calendarGrid({ ...august, month: '03' }), '2024-03-10').label).toBe('Sunday, March 10, 2024');
  });

  it('marks today, the selected day and where Tab enters', () => {
    const grid = calendarGrid({ ...august, value: '2024-08-15', tabDay: '2024-08-15' });
    expect(dates(grid, 'today')).toEqual(['2024-08-20']);
    expect(dates(grid, 'selected')).toEqual(['2024-08-15']);
    expect(dates(grid, 'tabbable')).toEqual(['2024-08-15']);
    expect(dates(grid, 'inRange')).toEqual([]);
  });

  it('marks the ends of a range as selected, and the days between as in range', () => {
    const grid = calendarGrid({ ...august, value: { start: '2024-08-05', end: '2024-08-08' } });
    expect(dates(grid, 'selected')).toEqual(['2024-08-05', '2024-08-08']);
    expect(dates(grid, 'rangeStart')).toEqual(['2024-08-05']);
    expect(dates(grid, 'rangeEnd')).toEqual(['2024-08-08']);
    expect(dates(grid, 'inRange')).toEqual(['2024-08-06', '2024-08-07']);
    // a range across months: the days of this month in it
    const across = calendarGrid({ ...august, month: '09', value: { start: '2024-08-28', end: '2024-09-03' } });
    expect(dates(across, 'inRange')).toEqual(['2024-09-01', '2024-09-02']);
    expect(dates(across, 'selected')).toEqual(['2024-09-03']);
  });

  it('disables the days that cannot be chosen', () => {
    const grid = calendarGrid({ ...august, availability: { min: '2024-08-03', disabledDates: ['2024-08-15'] } });
    expect(dates(grid, 'unavailable')).toEqual(['2024-08-01', '2024-08-02', '2024-08-15']);
    expect(dates(grid, 'disabled')).toEqual(['2024-08-01', '2024-08-02', '2024-08-15']);
  });

  it('with fullWeeks, shows the adjacent days disabled, and never selected nor today', () => {
    const grid = calendarGrid({
      ...august,
      today: '2024-07-31',
      value: { start: '2024-07-30', end: '2024-09-02' },
      fullWeeks: true,
      weekStartsOn: 1,
    });
    expect(grid.weeks).toHaveLength(6);
    expect(grid.weeks[0].days[0]?.date).toBe('2024-07-29');
    const outside = dates(grid, 'outside');
    expect(outside).toContain('2024-07-31');
    expect(outside).toContain('2024-09-01');
    expect(dates(grid, 'disabled')).toEqual(outside);
    expect(dates(grid, 'unavailable')).toEqual([]);
    expect(dates(grid, 'today')).toEqual([]);
    expect(dates(grid, 'selected')).toEqual([]);
    expect(dates(grid, 'inRange')).toEqual(
      days(grid)
        .filter((day) => !day.outside)
        .map((day) => day.date),
    );
  });
});

describe.each(TIMEZONES)('where Tab enters in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('enters on the day keeping the focus, when it is in the month and can be chosen', () => {
    expect(tabDayOf(2024, '08', '2024-08-15')).toBe('2024-08-15');
  });

  it('enters on the first day of the month that can be chosen otherwise', () => {
    expect(tabDayOf(2024, '09', '2024-08-15')).toBe('2024-09-01');
    expect(tabDayOf(2024, '08', '2024-08-15', { disabledDates: ['2024-08-15'] })).toBe('2024-08-01');
    expect(tabDayOf(2024, '08', '2024-08-15', { disabledDates: ['2024-08-15'], disabledWeekdays: [4, 5, 6] })).toBe(
      '2024-08-04',
    );
    expect(tabDayOf(2024, '08', '2024-07-10', { min: '2024-08-20' })).toBe('2024-08-20');
  });

  it('has nowhere to enter when no day of the month can be chosen', () => {
    expect(tabDayOf(2024, '08', '2024-08-15', { max: '2024-07-31' })).toBeNull();
  });
});

describe.each(TIMEZONES)('the selection in the calendar name in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('names the selected day or range, or nothing without a value', () => {
    const en = resolveLabels('en');
    expect(selectionLabel(null, 'en', en)).toBeNull();
    expect(selectionLabel('2024-08-15', 'en', en)).toBe('selected date: Thursday, August 15, 2024');
    expect(selectionLabel({ start: '2024-08-05', end: '2024-08-12' }, 'en', en)).toBe(
      'selected range: Monday, August 5, 2024 – Monday, August 12, 2024',
    );
    expect(selectionLabel({ start: '2024-08-20', end: null }, 'en', en)).toBe(
      'selected range: Tuesday, August 20, 2024 – …',
    );
    expect(selectionLabel('2024-08-15', 'es', resolveLabels('es'))).toBe(
      'fecha seleccionada: jueves, 15 de agosto de 2024',
    );
  });
});

describe('values', () => {
  it('opens on the selected day, or the start of the range', () => {
    expect(openingDay(null)).toBeNull();
    expect(openingDay('2024-08-15')).toBe('2024-08-15');
    expect(openingDay({ start: '2024-08-05', end: '2024-08-12' })).toBe('2024-08-05');
  });

  it('chooses a day, or the end of the range it starts', () => {
    expect(nextValue('single', '2024-08-15', '2024-08-20')).toBe('2024-08-20');
    expect(nextValue('range', null, '2024-08-20')).toEqual({ start: '2024-08-20', end: null });
    expect(nextValue('range', { start: '2024-08-20', end: null }, '2024-08-25')).toEqual({
      start: '2024-08-20',
      end: '2024-08-25',
    });
    // a range stops before a day that can't be chosen
    expect(
      nextValue('range', { start: '2024-08-20', end: null }, '2024-08-25', { disabledDates: ['2024-08-23'] }),
    ).toEqual({ start: '2024-08-20', end: '2024-08-22' });
  });

  it('accepts existing days, and ranges that end after they start', () => {
    expect(isValidValue('2024-08-15')).toBe(true);
    expect(isValidValue('2024-02-30' as LocalDate)).toBe(false);
    expect(isValidValue({ start: '2024-08-05', end: null })).toBe(true);
    expect(isValidValue({ start: '2024-08-12', end: '2024-08-05' })).toBe(false);
  });
});
