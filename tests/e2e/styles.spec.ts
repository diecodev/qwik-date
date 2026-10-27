import { expect, test } from '@playwright/test';
import { calendarIn, contrastRatio, day } from './helpers';

test('the day numbers and the trigger use the page font', async ({ page }) => {
  await page.goto('/e2e/picker/');
  const calendar = calendarIn(page, 'inline');
  for (const element of [
    calendar.locator('header > div'),
    calendar.locator('th').first(),
    day(calendar, '2024-08-06'),
    page.locator('#picker button[popovertarget]'),
  ]) {
    await expect(element).toHaveCSS('font-family', 'Georgia, serif');
  }
});

test('the weekday names and week numbers meet WCAG AA contrast', async ({ page }) => {
  await page.goto('/e2e/calendar/');
  const calendar = calendarIn(page, 'full-weeks');
  expect(await contrastRatio(calendar.locator('th').first())).toBeGreaterThanOrEqual(4.5);
  expect(await contrastRatio(calendar.locator('tbody td:has(> span) span').first())).toBeGreaterThanOrEqual(4.5);
});

test('right-to-left layouts mirror the month chevrons', async ({ page }) => {
  await page.goto('/e2e/calendar/');
  for (const button of await calendarIn(page, 'rtl').locator('header button').all()) {
    await expect(button).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  }
  await expect(calendarIn(page, 'basic').locator('header button').first()).toHaveCSS('transform', 'none');
});

test('unStyled can change at runtime', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/e2e/styles/');
  const calendar = calendarIn(page, 'toggle');
  await expect(calendar).toHaveCSS('box-shadow', 'none');
  await page.locator('#toggle-unstyled').click();
  await expect(calendar).not.toHaveCSS('box-shadow', 'none');
  await day(calendar, '2024-08-20').click();
  await expect(calendar.locator('td:has(> button[data-value="2024-08-20"])')).toHaveAttribute('aria-selected', 'true');
  await page.locator('#toggle-unstyled').click();
  await expect(calendar).toHaveCSS('box-shadow', 'none');
  expect(errors).toEqual([]);
});
