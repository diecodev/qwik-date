import { describe, expect, it } from 'vitest';
import { type GridKey, addDays, keyTarget } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

describe.each(TIMEZONES)('keyboard targets in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it.each([
    ['2024-08-15', 'arrowright', '2024-08-16'],
    ['2024-08-31', 'arrowright', '2024-09-01'],
    ['2024-08-01', 'arrowleft', '2024-07-31'],
    ['2024-08-29', 'arrowdown', '2024-09-05'],
    ['2024-08-02', 'arrowup', '2024-07-26'],
    ['2024-08-31', 'pagedown', '2024-09-30'],
    ['2024-01-31', 'pagedown', '2024-02-29'],
    ['2024-03-31', 'pageup', '2024-02-29'],
    // across daylight saving changes
    ['2024-03-30', 'arrowdown', '2024-04-06'],
    ['2024-10-26', 'arrowdown', '2024-11-02'],
  ] as const)('%s %s → %s', (day, key, target) => {
    expect(keyTarget(day, key as GridKey)).toBe(target);
  });

  it('moves Home and End along the row, inside the month without fullWeeks', () => {
    expect(keyTarget('2024-08-06', 'home')).toBe('2024-08-04');
    expect(keyTarget('2024-08-06', 'end')).toBe('2024-08-10');
    expect(keyTarget('2024-08-02', 'home')).toBe('2024-08-01');
    expect(keyTarget('2024-09-29', 'end')).toBe('2024-09-30');
    expect(keyTarget('2024-08-02', 'home', { fullWeeks: true })).toBe('2024-07-28');
    expect(keyTarget('2024-09-29', 'end', { fullWeeks: true })).toBe('2024-10-05');
  });

  it('follows weekStartsOn for Home and End', () => {
    expect(keyTarget('2024-08-15', 'home', { weekStartsOn: 1 })).toBe('2024-08-12');
    expect(keyTarget('2024-08-15', 'end', { weekStartsOn: 1 })).toBe('2024-08-18');
  });

  it('adds days across months and years', () => {
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
  });
});
