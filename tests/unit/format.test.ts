import { describe, expect, it } from 'vitest';
import { capitalize, formatDate } from '../../src/lib/core';
import { TIMEZONES, useTimezone } from './timezones';

describe.each(TIMEZONES)('formatDate in %s', (tz, offset) => {
  useTimezone(tz, offset);

  it('shows the day itself, whatever the timezone', () => {
    expect(formatDate('2024-08-15', 'en')).toBe('Aug 15, 2024');
    expect(formatDate('2024-01-01', 'en')).toBe('Jan 01, 2024');
    expect(formatDate('2024-12-31', 'en')).toBe('Dec 31, 2024');
  });

  it('pads the day and capitalizes the month', () => {
    expect(formatDate('2024-08-01', 'es')).toBe('01 Ago 2024');
  });
});

describe('capitalize', () => {
  it('upper-cases the first letter only', () => {
    expect(capitalize('agosto', 'es')).toBe('Agosto');
    expect(capitalize('August', 'en')).toBe('August');
  });
});
