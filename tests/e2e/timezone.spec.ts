import { expect, test } from '@playwright/test';
import { calendarIn, day, prevButton } from './helpers';

// keyboard date math runs in the browser: shifting across a DST change must not lose a day
for (const [timezoneId, cases] of [
  [
    'Europe/Madrid',
    [
      [5, '2024-03-15', 'PageDown', '2024-04-15'],
      [5, '2024-03-30', 'ArrowDown', '2024-04-06'],
    ],
  ],
  ['America/New_York', [[6, '2024-02-15', 'PageDown', '2024-03-15']]],
] as const) {
  test.describe(`in ${timezoneId}`, () => {
    test.use({ timezoneId });

    for (const [prevClicks, from, key, expected] of cases) {
      test(`${key} from ${from} goes to ${expected}`, async ({ page }) => {
        await page.goto('/e2e/calendar/');
        const calendar = calendarIn(page, 'basic');
        for (let i = 0; i < prevClicks; i++) await prevButton(calendar).click();
        await day(calendar, from).focus();
        await page.keyboard.press(key);
        await expect(day(calendar, expected)).toBeFocused();
      });
    }
  });
}
