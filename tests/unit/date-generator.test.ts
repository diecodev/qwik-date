import { describe, expect, it } from 'vitest';
import { type Month, daysArrGenerator } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

const days = (month: Month, year: string, fullWeeks = false) => daysArrGenerator({ month, year, fullWeeks });

describe.each(TIMEZONES)('daysArrGenerator in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('pads the first and last rows with nulls when fullWeeks is off', () => {
    const rows = days('08', '2024'); // Aug 1 2024 is a Thursday
    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual([null, null, null, null, '2024-08-01', '2024-08-02', '2024-08-03']);
    expect(rows[4]).toEqual([
      '2024-08-25',
      '2024-08-26',
      '2024-08-27',
      '2024-08-28',
      '2024-08-29',
      '2024-08-30',
      '2024-08-31',
    ]);
  });

  it('fills six full weeks with the adjacent months when fullWeeks is on', () => {
    const rows = days('08', '2024', true);
    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.length === 7 && row.every((day) => day !== null))).toBe(true);
    expect(rows[0][0]).toBe('2024-07-28');
    expect(rows[5][6]).toBe('2024-09-07');
  });

  it('crosses the year boundary with the adjacent months', () => {
    expect(days('01', '2025', true)[0][0]).toBe('2024-12-29');
    expect(days('12', '2024', true)[5][6]).toBe('2025-01-11');
  });

  it.each([
    ['02', '2024', 29],
    ['02', '2023', 28],
    ['02', '2100', 28],
    ['04', '2024', 30],
    ['12', '2024', 31],
  ] as const)('lists every day of %s/%s once and in order', (month, year, length) => {
    const list = days(month, year)
      .flat()
      .filter((day) => day !== null);
    expect(list).toHaveLength(length);
    expect(list).toEqual([...list].sort());
    expect(new Set(list).size).toBe(length);
  });

  it('starts without padding when the month starts on a Sunday', () => {
    expect(days('09', '2024')[0][0]).toBe('2024-09-01');
  });
});
