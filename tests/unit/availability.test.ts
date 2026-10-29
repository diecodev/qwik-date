import { describe, expect, it } from 'vitest';
import { isMonthInLimits, isUnavailable, nearestAvailable, nextRange } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

describe.each(TIMEZONES)('availability in %s', (tz, offset) => {
  useTimezone(tz, offset);

  const limits = { min: '2024-08-05', max: '2024-08-25' } as const;
  const weekdays = { disabledWeekdays: [0, 6], disabledDates: ['2024-08-15'] } as const;

  it('disables the days outside min and max, the listed dates and the listed weekdays', () => {
    expect(isUnavailable('2024-08-04', limits)).toBe(true);
    expect(isUnavailable('2024-08-05', limits)).toBe(false);
    expect(isUnavailable('2024-08-25', limits)).toBe(false);
    expect(isUnavailable('2024-08-26', limits)).toBe(true);
    expect(isUnavailable('2024-08-15', weekdays)).toBe(true);
    expect(isUnavailable('2024-08-17', weekdays)).toBe(true); // Saturday
    expect(isUnavailable('2024-08-18', weekdays)).toBe(true); // Sunday
    expect(isUnavailable('2024-08-16', weekdays)).toBe(false);
  });

  it('finds the nearest day that can be chosen, in a direction', () => {
    expect(nearestAvailable('2024-08-17', 1, weekdays)).toBe('2024-08-19');
    expect(nearestAvailable('2024-08-17', -1, weekdays)).toBe('2024-08-16');
    expect(nearestAvailable('2024-08-15', 1, weekdays)).toBe('2024-08-16');
  });

  it('goes back to min or max from a day past them', () => {
    expect(nearestAvailable('2024-09-20', 1, limits)).toBe('2024-08-25');
    expect(nearestAvailable('2024-07-31', -1, limits)).toBe('2024-08-05');
    expect(nearestAvailable('2024-09-20', 1, { ...limits, disabledDates: ['2024-08-25'] })).toBe('2024-08-24');
    // nothing left in the direction of travel: stay put
    expect(nearestAvailable('2024-08-25', 1, { ...limits, disabledDates: ['2024-08-25'] })).toBeNull();
  });

  it('gives up when nothing can be chosen', () => {
    expect(nearestAvailable('2024-08-15', 1, { disabledWeekdays: [0, 1, 2, 3, 4, 5, 6] })).toBeNull();
  });

  it('knows which months the limits allow', () => {
    expect(isMonthInLimits(2024, '08', limits)).toBe(true);
    expect(isMonthInLimits(2024, '07', limits)).toBe(false);
    expect(isMonthInLimits(2024, '09', limits)).toBe(false);
    expect(isMonthInLimits(2024, '09', {})).toBe(true);
  });

  it('stops a range right before a day that cannot be chosen, in both directions', () => {
    const disabled = { disabledDates: ['2024-08-14'] } as const;
    expect(nextRange({ start: '2024-08-10', end: null }, '2024-08-20', disabled)).toEqual({
      start: '2024-08-10',
      end: '2024-08-13',
    });
    expect(nextRange({ start: '2024-08-20', end: null }, '2024-08-10', disabled)).toEqual({
      start: '2024-08-15',
      end: '2024-08-20',
    });
    expect(nextRange({ start: '2024-08-10', end: null }, '2024-08-12', disabled)).toEqual({
      start: '2024-08-10',
      end: '2024-08-12',
    });
  });
});
