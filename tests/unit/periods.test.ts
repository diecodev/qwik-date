import { describe, expect, it } from 'vitest';
import {
  canStep,
  clampMonth,
  clampYear,
  formatYear,
  isPageInLimits,
  isYearInLimits,
  monthCells,
  monthName,
  periodKeyTarget,
  sameDayIn,
  viewTitle,
  yearCells,
  yearPageStart,
} from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

const august = { year: 2024, month: '08' } as const;
const limits = { min: '2024-03-10', max: '2025-10-05' } as const;
const options = { focus: august, value: '2024-08-15', today: '2024-10-28', locale: 'en' } as const;

describe.each(TIMEZONES)('the months and years grids in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('has the twelve months of the focused year, short, with their long names', () => {
    const cells = monthCells(options);
    expect(cells.map((cell) => cell.text)).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]);
    expect(cells[7]).toMatchObject({ year: 2024, month: '08', label: 'August 2024', selected: true, tabbable: true });
    expect(cells.filter((cell) => cell.today).map((cell) => cell.month)).toEqual(['10']);
  });

  it('capitalizes the month names in every locale', () => {
    expect(monthCells({ ...options, locale: 'es' }).map((cell) => cell.label)[0]).toBe('Enero 2024');
    expect(monthCells({ ...options, locale: 'es' })[0].text).toMatch(/^Ene/);
    expect(monthCells({ ...options, locale: 'fr-FR' })[0].text).toMatch(/^Janv/);
    expect(monthCells({ ...options, locale: 'fr-FR' })[0].label).toBe('Janvier 2024');
    expect(monthName(8, 'de', 'long')).toBe('August');
  });

  it('marks the months with an end of a range, and disables the ones past min and max', () => {
    const range = monthCells({ ...options, value: { start: '2024-03-28', end: '2024-05-02' }, availability: limits });
    expect(range.filter((cell) => cell.selected).map((cell) => cell.month)).toEqual(['03', '05']);
    expect(range.filter((cell) => cell.disabled).map((cell) => cell.month)).toEqual(['01', '02']);
  });

  it('has twelve years from a multiple of twelve, past min and max disabled', () => {
    const cells = yearCells({ ...options, availability: limits });
    expect(cells.map((cell) => cell.year)).toEqual([
      2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027,
    ]);
    expect(cells.filter((cell) => !cell.disabled).map((cell) => cell.year)).toEqual([2024, 2025]);
    expect(cells.filter((cell) => cell.selected || cell.today || cell.tabbable).map((cell) => cell.year)).toEqual([
      2024,
    ]);
    expect(yearPageStart(2016)).toBe(2016);
    expect(yearPageStart(2027)).toBe(2016);
    expect(yearPageStart(2028)).toBe(2028);
  });

  it('titles each view', () => {
    expect(viewTitle('days', august, august, 'en')).toBe('August 2024');
    expect(viewTitle('months', august, { year: 2025, month: '01' }, 'en')).toBe('2025');
    expect(viewTitle('years', august, august, 'en')).toBe('2016 – 2027');
    expect(viewTitle('days', august, august, 'es')).toBe('Agosto 2024');
    expect(formatYear(2024, 'ja')).toBe('2024年');
  });
});

describe('the months and years keys and limits', () => {
  it('moves along three columns, across years and pages', () => {
    expect(periodKeyTarget('months', august, 'arrowright')).toEqual({ year: 2024, month: '09' });
    expect(periodKeyTarget('months', august, 'arrowdown')).toEqual({ year: 2024, month: '11' });
    expect(periodKeyTarget('months', { year: 2024, month: '12' }, 'arrowright')).toEqual({ year: 2025, month: '01' });
    expect(periodKeyTarget('months', { year: 2024, month: '02' }, 'arrowup')).toEqual({ year: 2023, month: '11' });
    expect(periodKeyTarget('years', august, 'arrowleft')).toEqual({ year: 2023, month: '08' });
    expect(periodKeyTarget('years', { year: 2027, month: '08' }, 'arrowdown')).toEqual({ year: 2030, month: '08' });
  });

  it('stays put past min and max', () => {
    expect(periodKeyTarget('months', { year: 2024, month: '03' }, 'arrowleft', limits)).toBeNull();
    expect(periodKeyTarget('months', { year: 2025, month: '10' }, 'arrowright', limits)).toBeNull();
    expect(periodKeyTarget('years', { year: 2025, month: '08' }, 'arrowright', limits)).toBeNull();
  });

  it('knows which years and pages the limits allow', () => {
    expect(isYearInLimits(2023, limits)).toBe(false);
    expect(isYearInLimits(2025, limits)).toBe(true);
    expect(isPageInLimits(2016, limits)).toBe(true);
    expect(isPageInLimits(2028, limits)).toBe(false);
    expect(isPageInLimits(2004, limits)).toBe(false);
    expect(isPageInLimits(2028, {})).toBe(true);
  });

  it('moves the buttons a month, a year or a page, inside the limits', () => {
    expect(canStep(-1, 'days', { year: 2024, month: '04' }, august, limits)).toBe(true);
    expect(canStep(-1, 'days', { year: 2024, month: '03' }, august, limits)).toBe(false);
    expect(canStep(-1, 'months', august, { year: 2024, month: '08' }, limits)).toBe(false);
    expect(canStep(1, 'months', august, { year: 2024, month: '08' }, limits)).toBe(true);
    expect(canStep(1, 'years', august, august, limits)).toBe(false);
    expect(canStep(1, 'years', august, august, {})).toBe(true);
  });

  it('brings a month or a year inside the limits', () => {
    expect(clampMonth(2024, '01', limits)).toEqual({ year: 2024, month: '03' });
    expect(clampMonth(2025, '12', limits)).toEqual({ year: 2025, month: '10' });
    expect(clampMonth(2024, '08', limits)).toEqual({ year: 2024, month: '08' });
    expect(clampYear(2030, limits)).toBe(2025);
    expect(clampYear(2010, limits)).toBe(2024);
    expect(clampYear(2010, {})).toBe(2010);
  });

  it('keeps the day of the month, or the last one of a shorter month', () => {
    expect(sameDayIn('2024-08-15', { year: 2025, month: '01' })).toBe('2025-01-15');
    expect(sameDayIn('2024-08-31', { year: 2024, month: '09' })).toBe('2024-09-30');
    expect(sameDayIn('2024-01-31', { year: 2023, month: '02' })).toBe('2023-02-28');
  });
});
