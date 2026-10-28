import { describe, expect, it } from 'vitest';
import { type Month, daysArrGenerator, getRowWeekNumber, getWeekNumber } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

describe.each(TIMEZONES)('week numbers in %s', (tz, offset) => {
  useTimezone(tz, offset);

  describe('getWeekNumber (ISO-8601)', () => {
    it.each([
      ['2024-07-01', 27], // Monday
      ['2024-07-07', 27], // Sunday, still the same ISO week
      ['2024-08-05', 32],
      ['2024-12-30', 1], // Monday of 2025-W01
      ['2020-12-31', 53],
      ['2021-01-03', 53], // Sunday of 2020-W53
      ['2021-01-04', 1],
      ['2026-01-01', 1],
      ['2027-01-01', 53], // Friday of 2026-W53
    ])('%s is week %d', (date, week) => {
      expect(getWeekNumber(date)).toBe(week);
    });
  });

  describe('getRowWeekNumber (Sunday-first rows, numbered after their Monday)', () => {
    it.each([
      ['08', '2024', false, [31, 32, 33, 34, 35]],
      ['08', '2024', true, [31, 32, 33, 34, 35, 36]],
      ['12', '2024', false, [49, 50, 51, 52, 1]],
      ['03', '2024', true, [9, 10, 11, 12, 13, 14]],
      // a month ending on Sunday: the last row only shows that Sunday
      ['03', '2024', false, [9, 10, 11, 12, 13, 14]],
    ] as const)('%s/%s fullWeeks=%s', (month, year, fullWeeks, weeks) => {
      const rows = daysArrGenerator({ month: month as Month, year, fullWeeks });
      expect(rows.map((row) => getRowWeekNumber(row))).toEqual(weeks);
    });

    it.each([
      // Monday-first rows are whole ISO weeks
      [1, [31, 32, 33, 34, 35]],
      // Saturday-first: Saturday and Sunday belong to the previous ISO week, the other five to the Monday's
      [6, [31, 32, 33, 34, 35, 36]],
    ] as const)('August 2024 with weekStartsOn=%s', (weekStartsOn, weeks) => {
      const rows = daysArrGenerator({ month: '08', year: '2024', weekStartsOn });
      expect(rows.map((row) => getRowWeekNumber(row, weekStartsOn))).toEqual(weeks);
    });
  });
});
