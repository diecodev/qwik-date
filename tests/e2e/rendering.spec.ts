import { expect, test } from '@playwright/test';
import { calendarIn, day, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/calendar/');
});

test('shows the month of the given date', async ({ page }) => {
  const calendar = calendarIn(page, 'basic');
  await expect(title(calendar)).toHaveText('August 2024');
  await expect(calendar.locator('th')).toHaveText(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
  await expect(calendar.locator('button[data-value]')).toHaveCount(31);
  await expect(calendar.locator('button[data-preselected]')).toHaveAttribute('data-value', '2024-08-15');
});

test('labels every day with its full date', async ({ page }) => {
  await expect(day(calendarIn(page, 'basic'), '2024-08-15')).toHaveAttribute('aria-label', 'Thursday, August 15, 2024');
});

test('fullWeeks fills six rows with the adjacent days, disabled', async ({ page }) => {
  const calendar = calendarIn(page, 'full-weeks');
  await expect(calendar.locator('tbody tr')).toHaveCount(6);
  await expect(calendar.locator('button[data-value]')).toHaveCount(42);
  await expect(calendar.locator('button[data-value]:disabled')).toHaveCount(11);
  await expect(day(calendar, '2024-07-28')).toBeDisabled();
  await expect(day(calendar, '2024-09-07')).toBeDisabled();
});

test('showWeekNumber numbers each row after its ISO week', async ({ page }) => {
  const weeks = calendarIn(page, 'full-weeks').locator('tbody td:has(> span) span');
  await expect(weeks).toHaveText(['31', '32', '33', '34', '35', '36']);
});

test('locale "es" translates the title, the weekdays and the day labels', async ({ page }) => {
  const calendar = calendarIn(page, 'es');
  await expect(title(calendar)).toHaveText('Agosto 2024');
  await expect(calendar.locator('th')).toHaveText(['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']);
  await expect(day(calendar, '2024-08-15')).toHaveAttribute('aria-label', 'jueves, 15 de agosto de 2024');
});

test('showDaysOfWeek={false} hides the weekday row', async ({ page }) => {
  await expect(calendarIn(page, 'no-weekdays').locator('thead')).toHaveCount(0);
});

test('does not move the focus when the page loads', async ({ page }) => {
  // the calendar's visible tasks run once it's on screen: give them the chance to (wrongly) focus a day
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
});
