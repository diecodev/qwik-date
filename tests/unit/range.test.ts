import { describe, expect, it } from 'vitest';
import { formatDateRange, isInsideRange, isValidRange, nextRange } from '../../src/lib/core';

describe('nextRange', () => {
  it('starts a range with the first day and ends it with the second', () => {
    const started = nextRange(null, '2024-08-05');
    expect(started).toEqual({ start: '2024-08-05', end: null });
    expect(nextRange(started, '2024-08-12')).toEqual({ start: '2024-08-05', end: '2024-08-12' });
  });

  it('swaps a second day earlier than the start', () => {
    expect(nextRange({ start: '2024-08-12', end: null }, '2024-08-05')).toEqual({
      start: '2024-08-05',
      end: '2024-08-12',
    });
  });

  it('makes a one-day range with the same day twice', () => {
    expect(nextRange({ start: '2024-08-05', end: null }, '2024-08-05')).toEqual({
      start: '2024-08-05',
      end: '2024-08-05',
    });
  });

  it('starts a new range after a complete one', () => {
    expect(nextRange({ start: '2024-08-05', end: '2024-08-12' }, '2024-08-20')).toEqual({
      start: '2024-08-20',
      end: null,
    });
  });
});

describe('isInsideRange', () => {
  const range = { start: '2024-08-28', end: '2024-09-03' } as const;

  it('takes the days strictly between the start and the end, across months', () => {
    expect(isInsideRange('2024-08-31', range)).toBe(true);
    expect(isInsideRange('2024-09-01', range)).toBe(true);
    expect(isInsideRange('2024-08-28', range)).toBe(false);
    expect(isInsideRange('2024-09-03', range)).toBe(false);
  });

  it('has no inside without an end', () => {
    expect(isInsideRange('2024-08-29', { start: '2024-08-28', end: null })).toBe(false);
  });
});

describe('isValidRange', () => {
  it('accepts existing days in order, or a start alone', () => {
    expect(isValidRange({ start: '2024-08-05', end: '2024-08-12' })).toBe(true);
    expect(isValidRange({ start: '2024-08-05', end: null })).toBe(true);
    expect(isValidRange({ start: '2024-08-12', end: '2024-08-05' })).toBe(false);
    expect(isValidRange({ start: '2024-02-30', end: null })).toBe(false);
  });
});

describe('formatDateRange', () => {
  it('shows two full dates, or the start alone until there is an end', () => {
    expect(formatDateRange({ start: '2024-08-05', end: '2024-08-12' }, 'en')).toBe('Aug 05, 2024 – Aug 12, 2024');
    expect(formatDateRange({ start: '2024-08-05', end: null }, 'es')).toBe('05 Ago 2024 – …');
  });

  it('formats in English without a locale', () => {
    expect(formatDateRange({ start: '2024-08-05', end: '2024-08-12' })).toBe('Aug 05, 2024 – Aug 12, 2024');
  });
});
