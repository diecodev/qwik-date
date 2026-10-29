import { type Locator, type Page, expect, test } from '@playwright/test';
import { calendarIn, day } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/e2e/months/');
});

const grids = (page: Page, section: string) => page.locator(`#${section} [role="grid"]`);
const button = (calendar: Locator, name: RegExp) => calendar.getByRole('button', { name });

/**
 * The names of the grids, in order: one by one, since the grids render apart and two can share a name for a moment
 * (`getByRole` with that name would find both).
 */
const expectMonths = async (page: Page, section: string, names: string[]) => {
  await expect(grids(page, section)).toHaveCount(names.length);
  for (const [index, name] of names.entries()) await expect(grids(page, section).nth(index)).toHaveAccessibleName(name);
};

test('shows the months side by side, each grid named after its month', async ({ page }) => {
  const section = page.locator('#two');
  const august = section.getByRole('grid', { name: 'August 2024' });
  const september = section.getByRole('grid', { name: 'September 2024' });
  await expect(august).toBeVisible();
  await expect(september).toBeVisible();
  const [a, s] = [await august.boundingBox(), await september.boundingBox()];
  expect(s?.y).toBe(a?.y);
  expect(s?.x).toBeGreaterThan((a?.x ?? 0) + (a?.width ?? 0));
  // one Tab stop for both
  await expect(section.locator('button[data-value][tabindex="0"]')).toHaveAttribute('data-value', '2024-08-15');
});

test('the buttons move one month', async ({ page }) => {
  const calendar = calendarIn(page, 'two');
  await button(calendar, /next month/).click();
  await expectMonths(page, 'two', ['September 2024', 'October 2024']);
  await button(calendar, /previous month/).click();
  await expectMonths(page, 'two', ['August 2024', 'September 2024']);
});

test('a value written from outside shows in the first month, unless its month is on show', async ({ page }) => {
  const calendar = calendarIn(page, 'outside');
  await expectMonths(page, 'outside', ['August 2024', 'September 2024']);
  // its month is on show: nothing moves
  await page.locator('#outside-shown').click();
  await expect(day(calendar, '2024-09-10')).toHaveAttribute('data-selected');
  await expectMonths(page, 'outside', ['August 2024', 'September 2024']);
  // a later month opens first, as on load, not last (the keyboard's as few months as it takes)
  await page.locator('#outside-later').click();
  await expectMonths(page, 'outside', ['March 2025', 'April 2025']);
  await page.locator('#outside-earlier').click();
  await expectMonths(page, 'outside', ['May 2024', 'June 2024']);
});

test('the keyboard goes from one grid to the next without jumps', async ({ page }) => {
  const section = page.locator('#two');
  const calendar = calendarIn(page, 'two');
  await day(calendar, '2024-08-31').focus();
  await page.keyboard.press('ArrowRight');
  await expect(day(calendar, '2024-09-01')).toBeFocused();
  await expectMonths(page, 'two', ['August 2024', 'September 2024']);
  // past the last month: one month forward
  await day(calendar, '2024-09-26').focus();
  await page.keyboard.press('ArrowDown');
  await expect(day(calendar, '2024-10-03')).toBeFocused();
  await expectMonths(page, 'two', ['September 2024', 'October 2024']);
  // inside the months on show, no move
  await page.keyboard.press('PageUp');
  await expect(day(calendar, '2024-09-03')).toBeFocused();
  await expectMonths(page, 'two', ['September 2024', 'October 2024']);
  // before the first month: one month back
  await page.keyboard.press('PageUp');
  await expect(day(calendar, '2024-08-03')).toBeFocused();
  await expectMonths(page, 'two', ['August 2024', 'September 2024']);
  await expect(section.locator('button[data-value][tabindex="0"]')).toHaveCount(1);
});

test('with fullWeeks, the keyboard goes to the day of the next grid, not to its disabled copy', async ({ page }) => {
  const calendar = calendarIn(page, 'full-weeks');
  await day(calendar, '2024-08-31').focus();
  await page.keyboard.press('ArrowRight');
  await expect(calendar.locator('button[data-value="2024-09-01"]:not([disabled])')).toBeFocused();
});

test('a range and its preview show across the months', async ({ page }) => {
  const calendar = calendarIn(page, 'range');
  await expect(calendar.locator('button[data-in-range]')).toHaveText(['29', '30', '31', '01', '02']);
  await day(calendar, '2024-08-25').click();
  await day(calendar, '2024-09-05').hover();
  await expect(calendar.locator('button[data-preview]')).toHaveCount(11);
  await day(calendar, '2024-09-05').click();
  await expect(calendar.locator('button[data-range-end]')).toHaveText('05');
});

test('next stops when the last month reaches max', async ({ page }) => {
  const calendar = calendarIn(page, 'limits');
  await expect(button(calendar, /next month/)).toHaveAttribute('aria-disabled', 'true');
  await expect(button(calendar, /previous month/)).not.toHaveAttribute('aria-disabled');
});

test('the months and years views show one grid', async ({ page }) => {
  const calendar = calendarIn(page, 'two');
  await calendar.locator('[aria-live] > button').click();
  await expect(page.locator('#two').getByRole('grid', { name: '2024', exact: true })).toBeVisible();
  await expect(grids(page, 'two')).toHaveCount(1);
  await calendar.locator('button[data-month="2024-11"]').click();
  await expectMonths(page, 'two', ['November 2024', 'December 2024']);
});

test('the months stack on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 900 });
  const august = page.locator('#two').getByRole('grid', { name: 'August 2024' });
  const september = page.locator('#two').getByRole('grid', { name: 'September 2024' });
  const [a, s] = [await august.boundingBox(), await september.boundingBox()];
  expect(s?.y).toBeGreaterThan((a?.y ?? 0) + (a?.height ?? 0));
  expect(s?.x).toBe(a?.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(420);
});

test('headless: Title and Grid take the offset of their month', async ({ page }) => {
  const section = page.locator('#headless');
  await expect(page.locator('#grids')).toHaveText('August 2024 | September 2024');
  await expect(section.getByRole('grid', { name: 'August 2024' })).toBeVisible();
  await expect(section.getByRole('grid', { name: 'September 2024' })).toBeVisible();
  await expect(section.locator('[role="grid"]').nth(1).locator('button[data-value]')).toHaveCount(30);
});
