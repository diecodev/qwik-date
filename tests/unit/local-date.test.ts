import { describe, expect, it } from 'vitest';
import { addMonths, isValidLocalDate, parseLocalDate, toLocalDateString } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

// every day of a leap year, built without Date so the list doesn't depend on the timezone
const daysOf2024 = () => {
  const lengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths.flatMap((length, month) =>
    Array.from(
      { length },
      (_, day) => `2024-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`,
    ),
  );
};

describe.each(TIMEZONES)('local dates in %s', (tz, offset) => {
  useTimezone(tz, offset);

  describe('toLocalDateString', () => {
    it('uses the local calendar day, late in the evening and early in the morning', () => {
      expect(toLocalDateString(new Date(2026, 9, 27, 23, 30))).toBe('2026-10-27');
      expect(toLocalDateString(new Date(2026, 9, 27, 0, 30))).toBe('2026-10-27');
    });

    it('pads the month and the day', () => {
      expect(toLocalDateString(new Date(2024, 0, 5))).toBe('2024-01-05');
    });
  });

  describe('parseLocalDate', () => {
    it('returns local midnight of that day', () => {
      const date = parseLocalDate('2024-03-31');
      expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2024, 2, 31, 0]);
    });

    it('round-trips every day of the year, DST changes included', () => {
      for (const day of daysOf2024()) expect(toLocalDateString(parseLocalDate(day))).toBe(day);
    });
  });

  describe('addMonths', () => {
    it.each([
      ['2024-08-15', 1, '2024-09-15'],
      ['2024-08-15', -1, '2024-07-15'],
      ['2024-01-31', 1, '2024-02-29'],
      ['2023-01-31', 1, '2023-02-28'],
      ['2024-03-31', -1, '2024-02-29'],
      ['2024-08-31', 1, '2024-09-30'],
      ['2024-10-31', -1, '2024-09-30'],
      ['2024-12-31', 1, '2025-01-31'],
      ['2025-01-15', -1, '2024-12-15'],
      ['2024-03-10', 1, '2024-04-10'],
      ['2024-10-27', 1, '2024-11-27'],
    ])('%s shifted by %i month(s) is %s', (from, months, expected) => {
      expect(toLocalDateString(addMonths(parseLocalDate(from), months))).toBe(expected);
    });
  });
});

describe('isValidLocalDate', () => {
  it.each([
    ['2024-02-29', true],
    ['2000-02-29', true],
    ['2024-04-30', true],
    ['2024-12-31', true],
    ['2023-02-29', false],
    ['2100-02-29', false],
    ['2024-02-31', false],
    ['2024-04-31', false],
    ['2024-01-00', false],
    ['2024-13-01', false],
    ['2024-00-10', false],
    ['2024-1-05', false],
    ['not a date', false],
  ])('%s -> %s', (value, expected) => {
    expect(isValidLocalDate(value)).toBe(expected);
  });
});
