import { expect, test } from '@playwright/test';
import { calendarIn, contrastRatio, day } from './helpers';

test('the title, the weekdays and the day numbers use the page font', async ({ page }) => {
  await page.goto('/e2e/styles/');
  const calendar = calendarIn(page, 'font');
  for (const element of [
    calendar.locator('header > div'),
    calendar.locator('th').first(),
    day(calendar, '2024-08-06'),
  ]) {
    await expect(element).toHaveCSS('font-family', 'Georgia, serif');
  }
});

test('a calendar that is a popover keeps the library styles, without the browser border', async ({ page }) => {
  await page.goto('/e2e/styles/');
  const styled = page.locator('#styled-popover');
  await page.locator('#open-styled').click();
  await expect(styled).toBeVisible();
  await expect(styled).not.toHaveCSS('box-shadow', 'none');
  await expect(styled).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(styled).toHaveCSS('border-top-width', '0px');
  // unstyled, it gets none of them: the browser's popover border stays
  const unstyled = page.locator('#unstyled-popover');
  await page.locator('#open-unstyled').click();
  await expect(unstyled).toBeVisible();
  await expect(unstyled).toHaveCSS('box-shadow', 'none');
  await expect(unstyled).not.toHaveCSS('border-top-width', '0px');
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

test('the icons keep a size of their own without the stylesheet', async ({ page }) => {
  await page.goto('/e2e/styles/');
  // the calendar starts unstyled: the chevrons must show, at the size of the text
  for (const icon of await calendarIn(page, 'toggle').locator('header button svg').all()) {
    const box = await icon.boundingBox();
    expect(box?.width).toBeGreaterThan(10);
    expect(box?.width).toBeLessThan(24);
  }
});

test('unstyled can change at runtime', async ({ page }) => {
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
