import { expect, test } from '@playwright/test';
import { calendarIn, day, focusedDay, nextButton, prevButton, title } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/availability/');
});

const press = async (page: import('@playwright/test').Page, section: string, from: string, key: string) => {
  await day(calendarIn(page, section), from).focus();
  await page.keyboard.press(key);
};

test('min and max disable the days past them, and the month buttons at the limits', async ({ page }) => {
  const calendar = calendarIn(page, 'limits');
  await expect(calendar.locator('button[data-unavailable]')).toHaveText([
    '01',
    '02',
    '03',
    '04',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
  ]);
  await expect(day(calendar, '2024-08-04')).toBeDisabled();
  await expect(day(calendar, '2024-08-05')).toBeEnabled();
  await expect(prevButton(calendar)).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton(calendar)).toHaveAttribute('aria-disabled', 'true');
  // still focusable, but they don't change the month (Playwright doesn't click aria-disabled buttons: force it)
  await prevButton(calendar).focus();
  await page.keyboard.press('Enter');
  await expect(prevButton(calendar)).toBeFocused();
  await nextButton(calendar).click({ force: true });
  await expect(title(calendar)).toHaveText('August 2024');
});

test('disabledDates and disabledWeekdays disable those days', async ({ page }) => {
  const calendar = calendarIn(page, 'weekdays');
  await expect(day(calendar, '2024-08-15')).toBeDisabled();
  // the Sundays and Saturdays of August 2024
  await expect(calendar.locator('button[data-unavailable]')).toHaveCount(10);
  await expect(day(calendar, '2024-08-17')).toHaveAttribute('data-unavailable');
  await expect(calendar.locator('td:has(> button[data-value="2024-08-17"])')).toHaveAttribute('aria-disabled', 'true');
  await day(calendar, '2024-08-15').click({ force: true });
  await day(calendar, '2024-08-16').click();
  await expect(page.locator('#changes')).toHaveText('2024-08-16');
});

test.describe('the keyboard skips the days that cannot be chosen', () => {
  for (const [from, key, expected] of [
    ['2024-08-14', 'ArrowRight', '2024-08-16'],
    ['2024-08-16', 'ArrowRight', '2024-08-19'],
    ['2024-08-19', 'ArrowLeft', '2024-08-16'],
    ['2024-08-14', 'Home', '2024-08-12'],
    ['2024-08-14', 'End', '2024-08-16'],
    ['2024-08-08', 'ArrowDown', '2024-08-16'],
  ]) {
    test(`${key} from ${from} goes to ${expected}`, async ({ page }) => {
      await press(page, 'weekdays', from, key);
      await expect(day(calendarIn(page, 'weekdays'), expected)).toBeFocused();
    });
  }
});

test.describe('the keyboard stops at min and max', () => {
  for (const [from, key, expected] of [
    ['2024-08-25', 'ArrowRight', '2024-08-25'],
    ['2024-08-20', 'ArrowDown', '2024-08-25'],
    ['2024-08-20', 'PageDown', '2024-08-25'],
    ['2024-08-05', 'ArrowLeft', '2024-08-05'],
    ['2024-08-10', 'PageUp', '2024-08-05'],
  ]) {
    test(`${key} from ${from} goes to ${expected}`, async ({ page }) => {
      await press(page, 'limits', from, key);
      const calendar = calendarIn(page, 'limits');
      await expect(day(calendar, expected)).toBeFocused();
      await expect(title(calendar)).toHaveText('August 2024');
    });
  }
});

test('a range ends right before the first day that cannot be chosen', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  await day(calendar, '2024-08-20').click();
  await expect(page.locator('#ranges')).toHaveText('2024-08-10/2024-08-13');
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['11', '12']);
});

test('without a value it opens on the limit today is past, and Tab enters on a day that can be chosen', async ({
  page,
}) => {
  const future = calendarIn(page, 'future');
  await expect(title(future)).toHaveText('March 2099');
  await expect(future.locator('button[data-value][tabindex="0"]')).toHaveAttribute('data-value', '2099-03-10');
  await expect(prevButton(future)).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton(future)).not.toHaveAttribute('aria-disabled');
  await expect(title(calendarIn(page, 'past'))).toHaveText('January 2000');
  expect(await focusedDay(page)).not.toMatch(/^\d{4}-/);
});

test('the DatePicker takes them too', async ({ page }) => {
  await page.locator('#picker button[popovertarget]').click();
  const popover = page.locator('#picker [popover]');
  await expect(popover).toBeVisible();
  await expect(day(popover, '2024-08-26')).toBeDisabled();
  await expect(popover.locator('header button').first()).toHaveAttribute('aria-disabled', 'true');
});
