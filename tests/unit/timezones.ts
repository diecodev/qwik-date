import { afterAll, beforeAll, expect, it } from 'vitest';

// Date math must not depend on the machine's timezone: east and west of UTC, with and without DST
export const TIMEZONES = [
  ['UTC', 0],
  ['America/Bogota', 300],
  ['America/New_York', 300],
  ['Europe/Madrid', -60],
  ['Asia/Tokyo', -540],
  ['Pacific/Kiritimati', -840],
] as const;

/** Runs the surrounding describe block in `tz` (Node applies `process.env.TZ` changes at runtime). */
export const useTimezone = (tz: string, januaryOffset: number) => {
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = tz;
  });
  afterAll(() => {
    process.env.TZ = original;
  });
  it('runs in the expected timezone', () => {
    expect(new Date(2024, 0, 1).getTimezoneOffset()).toBe(januaryOffset);
  });
};
